const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./paymentMethods.controller");
const v = require("./paymentMethods.validation");

router.get("/", validate(v.memberIdQuerySchema, "query"), c.list);
router.post("/setup-checkout", validate(v.memberIdBodySchema), c.setupCheckout);
router.post("/", validate(v.createSchema), c.create);
router.patch(
  "/:id/default",
  validate(v.idParamSchema, "params"),
  validate(v.memberIdQuerySchema, "query"),
  c.setDefault,
);
router.delete(
  "/:id",
  validate(v.idParamSchema, "params"),
  validate(v.memberIdQuerySchema, "query"),
  c.remove,
);

module.exports = router;
