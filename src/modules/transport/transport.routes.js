const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./transport.controller");
const v = require("./transport.validation");

router.get("/service-types", c.listServiceTypes);
router.post("/review", validate(v.createSchema), c.review);
router.post("/requests", validate(v.createSchema), c.create);
router.get("/requests", validate(v.listQuerySchema, "query"), c.list);
router.get(
  "/requests/:id",
  validate(v.idParamSchema, "params"),
  validate(v.getByIdQuerySchema, "query"),
  c.getById,
);
router.get("/requests/:id/status", validate(v.idParamSchema, "params"), c.getStatus);
router.patch("/requests/:id/cancel", validate(v.idParamSchema, "params"), c.cancel);
router.post(
  "/requests/:id/simulate-progress",
  validate(v.idParamSchema, "params"),
  c.simulateProgress,
);

module.exports = router;
