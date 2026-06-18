const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./sourcing.controller");
const v = require("./sourcing.validation");

/** @swagger tags: [Sourcing] */
router.get("/overview", c.getOverview);
router.post("/review", validate(v.reviewSchema), c.review);
router.post("/requests", validate(v.createRequestSchema), c.createRequest);
router.post(
  "/my-requests",
  authenticate,
  validate(v.createMyRequestSchema),
  c.createMyRequest,
);
router.get("/requests", validate(v.listQuerySchema, "query"), c.listRequests);
router.get(
  "/requests/:id/pending-vehicle",
  authenticate,
  validate(v.idParamSchema, "params"),
  c.getPendingVehicle,
);
router.post(
  "/requests/:id/approve-vehicle",
  authenticate,
  validate(v.idParamSchema, "params"),
  c.approveVehicle,
);
router.post(
  "/requests/:id/reject-vehicle",
  authenticate,
  validate(v.idParamSchema, "params"),
  validate(v.rejectVehicleSchema),
  c.rejectVehicle,
);
router.get("/requests/:id", validate(v.idParamSchema, "params"), c.getRequest);
router.get("/requests/:id/status", validate(v.idParamSchema, "params"), c.getStatus);
router.patch("/requests/:id/cancel", validate(v.idParamSchema, "params"), c.cancel);
router.post(
  "/requests/:id/simulate-progress",
  validate(v.idParamSchema, "params"),
  c.simulateProgress,
);

module.exports = router;
