const stripeService = require("./stripe.service");

module.exports = async function stripeWebhook(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];
    const result = await stripeService.handleWebhookEvent(req.body, signature);
    res.json(result);
  } catch (e) {
    next(e);
  }
};
