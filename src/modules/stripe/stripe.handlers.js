const maintenanceRepository = require("../maintenance/maintenance.repository");
const detailingRepository = require("../detailing/detailing.repository");
const paymentMethodsRepository = require("../paymentMethods/paymentMethods.repository");
const { getStripe } = require("../../config/stripe");

function nowIso() {
  return new Date().toISOString();
}

async function fulfillMaintenancePayment(referenceId) {
  const row = await maintenanceRepository.findById(referenceId);
  if (!row || row.status !== "Awaiting approval") return;

  const timeline = (row.timeline || []).map((s) =>
    s.key === "awaiting_approval"
      ? { ...s, status: "completed", completedAt: nowIso() }
      : s,
  );
  const next = timeline.find((s) => s.key === "ready_for_delivery");
  if (next) next.status = "active";

  await maintenanceRepository.update(referenceId, {
    status: "Ready for delivery",
    timeline,
    approvedAt: new Date(),
    paidAt: new Date(),
  });
}

async function fulfillDetailingPayment(referenceId) {
  const row = await detailingRepository.findBookingById(referenceId);
  if (!row) return;
  if (row.status === "Cancelled" || row.status === "Completed") return;

  await detailingRepository.updateBooking(referenceId, {
    status: row.status === "Awaiting confirmation" ? "Confirmed" : row.status,
  });
}

async function savePaymentMethodFromStripe(memberId, paymentMethodId) {
  const stripe = getStripe();
  if (!stripe) return;

  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card = pm.card;
  if (!card) return;

  const existing = await paymentMethodsRepository.findByStripeId(paymentMethodId);
  if (existing) return;

  await paymentMethodsRepository.clearDefault(memberId);
  await paymentMethodsRepository.create({
    memberId,
    label: `${card.brand} •••• ${card.last4}`,
    brand: card.brand,
    last4: card.last4,
    expiryMonth: card.exp_month,
    expiryYear: card.exp_year,
    isDefault: true,
    stripePaymentMethodId: paymentMethodId,
  });
}

exports.fulfillPayment = async ({ purpose, referenceId, session }) => {
  if (purpose === "maintenance") {
    await fulfillMaintenancePayment(referenceId);
    return;
  }
  if (purpose === "detailing") {
    await fulfillDetailingPayment(referenceId);
    return;
  }
  if (purpose === "setup" && session?.metadata?.memberId) {
    const stripe = getStripe();
    if (!stripe) return;

    let paymentMethodId =
      typeof session.setup_intent === "object"
        ? session.setup_intent?.payment_method
        : null;

    if (!paymentMethodId && session.setup_intent) {
      const intentId =
        typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent.id;
      const intent = await stripe.setupIntents.retrieve(intentId);
      paymentMethodId =
        typeof intent.payment_method === "string"
          ? intent.payment_method
          : intent.payment_method?.id;
    }

    if (paymentMethodId) {
      await savePaymentMethodFromStripe(Number(session.metadata.memberId), paymentMethodId);
    }
  }
};
