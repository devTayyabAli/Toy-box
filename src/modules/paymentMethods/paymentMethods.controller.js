const paymentMethodsService = require("./paymentMethods.service");

exports.setupCheckout = async (req, res, next) => {
  try {
    const stripeService = require("../stripe/stripe.service");
    res.status(201).json({
      success: true,
      data: await stripeService.createSetupCheckoutSession(req.body),
    });
  } catch (e) {
    next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await paymentMethodsService.list(Number(req.query.memberId)),
    });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await paymentMethodsService.create(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.setDefault = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await paymentMethodsService.setDefault(
        req.params.id,
        Number(req.query.memberId),
      ),
    });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await paymentMethodsService.remove(
        req.params.id,
        Number(req.query.memberId),
      ),
    });
  } catch (e) {
    next(e);
  }
};
