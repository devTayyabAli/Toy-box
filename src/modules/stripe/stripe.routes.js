const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./stripe.controller");
const v = require("./stripe.validation");

/** @swagger tags: [Stripe] */

router.get("/config", c.getConfig);
router.post("/customer", validate(v.memberIdBodySchema), c.ensureCustomer);
router.post("/checkout", validate(v.checkoutSchema), c.createCheckout);
router.post("/setup-checkout", validate(v.setupCheckoutSchema), c.createSetupCheckout);
router.get(
  "/checkout/:sessionId",
  validate(v.sessionIdParamSchema, "params"),
  c.getCheckoutSession,
);

module.exports = router;
