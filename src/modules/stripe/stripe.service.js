const AppError = require("../../utils/AppError");
const { getStripe, isStripeEnabled } = require("../../config/stripe");
const { Member } = require("../../models");
const stripeRepository = require("./stripe.repository");
const { fulfillPayment } = require("./stripe.handlers");
const detailingRepository = require("../detailing/detailing.repository");
const maintenanceRepository = require("../maintenance/maintenance.repository");
function publicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 9000}`).replace(
    /\/$/,
    "",
  );
}

function successUrl(override) {
  return (
    override ||
    process.env.STRIPE_SUCCESS_URL ||
    `${publicBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`
  );
}

function cancelUrl(override) {
  return override || process.env.STRIPE_CANCEL_URL || `${publicBaseUrl()}/payment/cancel`;
}

function toStripeAmount(aed) {
  return Math.round(Number(aed) * 100);
}

function formatTransaction(row) {
  const r = row.get ? row.get({ plain: true }) : row;
  return {
    id: r.id,
    memberId: r.memberId,
    stripeSessionId: r.stripeSessionId,
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    purpose: r.purpose,
    referenceType: r.referenceType,
    referenceId: r.referenceId,
    metadata: r.metadata,
    createdAt: r.createdAt,
  };
}

async function getOrCreateStripeCustomer(member) {
  const stripe = getStripe();
  if (!stripe) throw new AppError("Stripe is not configured", 503);

  if (member.stripeCustomerId) {
    try {
      return await stripe.customers.retrieve(member.stripeCustomerId);
    } catch {
      /* recreate below */
    }
  }

  const customer = await stripe.customers.create({
    email: member.email,
    name: member.name || [member.firstName, member.lastName].filter(Boolean).join(" ") || undefined,
    metadata: { memberId: String(member.id) },
  });

  await member.update({ stripeCustomerId: customer.id });
  return customer;
}

async function resolveCheckoutPayload(body) {
  const { purpose, referenceId, memberId, amountAed, description, lineItems } = body;

  if (purpose === "maintenance") {
    const row = await maintenanceRepository.findById(referenceId);
    if (!row) throw new AppError("Maintenance request not found", 404);
    if (row.memberId !== memberId) throw new AppError("Forbidden", 403);
    if (row.status !== "Awaiting approval") {
      throw new AppError("Request is not awaiting approval", 400);
    }
    const amount = row.totalAmount;
    if (!amount || amount <= 0) throw new AppError("No amount to charge", 400);
    return {
      amountAed: amount,
      currency: (row.currency || "AED").toLowerCase(),
      description: `Maintenance ${row.referenceNumber || referenceId}`,
      referenceType: "maintenance_request",
      metadata: { maintenanceRequestId: String(referenceId) },
    };
  }

  if (purpose === "detailing") {
    const row = await detailingRepository.findBookingById(referenceId);
    if (!row) throw new AppError("Detailing booking not found", 404);
    if (row.memberId !== memberId) throw new AppError("Forbidden", 403);
    const amount = row.totalEstimate;
    if (!amount || amount <= 0) throw new AppError("No amount to charge", 400);
    return {
      amountAed: amount,
      currency: (row.currency || "AED").toLowerCase(),
      description: `Detailing ${row.referenceNumber || referenceId}`,
      referenceType: "booking",
      metadata: { bookingId: String(referenceId) },
    };
  }

  if (purpose === "generic") {
    if (!amountAed || amountAed <= 0) throw new AppError("amountAed is required", 400);
    return {
      amountAed,
      currency: "aed",
      description: description || "Toybox payment",
      referenceType: body.referenceType || null,
      metadata: body.metadata || {},
    };
  }

  throw new AppError("Invalid payment purpose", 400);
}

exports.getConfig = () => ({
  enabled: isStripeEnabled(),
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
});

exports.ensureCustomer = async (memberId) => {
  if (!isStripeEnabled()) throw new AppError("Stripe is not configured", 503);
  const member = await Member.unscoped().findByPk(memberId);
  if (!member) throw new AppError("Member not found", 404);
  const customer = await getOrCreateStripeCustomer(member);
  return { stripeCustomerId: customer.id, memberId: member.id };
};

exports.createCheckoutSession = async (body) => {
  if (!isStripeEnabled()) throw new AppError("Stripe is not configured", 503);

  const stripe = getStripe();
  const member = await Member.unscoped().findByPk(body.memberId);
  if (!member) throw new AppError("Member not found", 404);

  const resolved = await resolveCheckoutPayload(body);
  const customer = await getOrCreateStripeCustomer(member);

  const items =
    body.lineItems?.length > 0
      ? body.lineItems.map((item) => ({
          price_data: {
            currency: resolved.currency,
            product_data: { name: item.name },
            unit_amount: toStripeAmount(item.amountAed),
          },
          quantity: item.quantity || 1,
        }))
      : [
          {
            price_data: {
              currency: resolved.currency,
              product_data: { name: resolved.description },
              unit_amount: toStripeAmount(resolved.amountAed),
            },
            quantity: 1,
          },
        ];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customer.id,
    line_items: items,
    success_url: successUrl(body.successUrl),
    cancel_url: cancelUrl(body.cancelUrl),
    payment_method_types: ["card"],
    metadata: {
      memberId: String(body.memberId),
      purpose: body.purpose,
      referenceType: resolved.referenceType || "",
      referenceId: body.referenceId ? String(body.referenceId) : "",
      ...Object.fromEntries(
        Object.entries(resolved.metadata || {}).map(([k, v]) => [k, String(v)]),
      ),
    },
  });

  await stripeRepository.create({
    memberId: body.memberId,
    stripeSessionId: session.id,
    amount: resolved.amountAed,
    currency: (resolved.currency || "aed").toUpperCase(),
    status: "pending",
    purpose: body.purpose,
    referenceType: resolved.referenceType,
    referenceId: body.referenceId || null,
    metadata: { checkoutUrl: session.url },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    amountAed: resolved.amountAed,
    currency: (resolved.currency || "aed").toUpperCase(),
  };
};

exports.createSetupCheckoutSession = async (body) => {
  if (!isStripeEnabled()) throw new AppError("Stripe is not configured", 503);

  const stripe = getStripe();
  const member = await Member.unscoped().findByPk(body.memberId);
  if (!member) throw new AppError("Member not found", 404);

  const customer = await getOrCreateStripeCustomer(member);

  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: customer.id,
    success_url: successUrl(body.successUrl),
    cancel_url: cancelUrl(body.cancelUrl),
    payment_method_types: ["card"],
    metadata: {
      memberId: String(body.memberId),
      purpose: "setup",
    },
  });

  return { sessionId: session.id, checkoutUrl: session.url };
};

exports.getCheckoutSession = async (sessionId) => {
  if (!isStripeEnabled()) throw new AppError("Stripe is not configured", 503);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "setup_intent"],
  });

  const local = await stripeRepository.findBySessionId(sessionId);

  return {
    sessionId: session.id,
    status: session.status,
    paymentStatus: session.payment_status,
    mode: session.mode,
    amountTotal: session.amount_total ? session.amount_total / 100 : null,
    currency: session.currency?.toUpperCase(),
    customerEmail: session.customer_details?.email,
    metadata: session.metadata,
    localTransaction: local ? formatTransaction(local) : null,
  };
};

exports.handleWebhookEvent = async (rawBody, signature) => {
  if (!isStripeEnabled()) throw new AppError("Stripe is not configured", 503);

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new AppError("STRIPE_WEBHOOK_SECRET is not set", 500);

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    throw new AppError(`Webhook signature failed: ${err.message}`, 400);
  }

  if (event.type === "checkout.session.completed") {
    let session = event.data.object;
    if (session.mode === "setup" && typeof session.setup_intent === "string") {
      session = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["setup_intent"],
      });
    }
    const purpose = session.metadata?.purpose;
    const referenceId = session.metadata?.referenceId
      ? Number(session.metadata.referenceId)
      : null;

    await stripeRepository.updateBySessionId(session.id, {
      status: session.mode === "setup" ? "setup_completed" : "paid",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    });

    if (session.mode === "payment" && session.payment_status === "paid") {
      await fulfillPayment({ purpose, referenceId, session });
    } else if (session.mode === "setup") {
      await fulfillPayment({ purpose: "setup", referenceId: null, session });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await stripeRepository.updateBySessionId(session.id, { status: "expired" });
  }

  return { received: true, type: event.type };
};
