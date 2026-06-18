const stripeService = require("./stripe.service");

exports.getConfig = async (req, res, next) => {
  try {
    res.json({ success: true, data: stripeService.getConfig() });
  } catch (e) {
    next(e);
  }
};

exports.createCheckout = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: await stripeService.createCheckoutSession(req.body),
    });
  } catch (e) {
    next(e);
  }
};

exports.createSetupCheckout = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: await stripeService.createSetupCheckoutSession(req.body),
    });
  } catch (e) {
    next(e);
  }
};

exports.getCheckoutSession = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await stripeService.getCheckoutSession(req.params.sessionId),
    });
  } catch (e) {
    next(e);
  }
};

exports.ensureCustomer = async (req, res, next) => {
  try {
    res.json({ success: true, data: await stripeService.ensureCustomer(req.body.memberId) });
  } catch (e) {
    next(e);
  }
};
