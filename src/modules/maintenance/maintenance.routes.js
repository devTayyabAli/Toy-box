const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./maintenance.controller");
const v = require("./maintenance.validation");

/** @swagger tags: [Maintenance] */
router.get("/catalog", c.getCatalog);
router.get("/service-types", c.getServiceTypes);
router.get("/locations", c.getLocations);
router.post("/estimate", validate(v.estimateSchema), c.estimate);
router.post("/review", validate(v.estimateSchema), c.review);
router.get("/requests", validate(v.listRequestsQuerySchema, "query"), c.listRequests);
router.post("/requests", validate(v.createRequestSchema), c.createRequest);

router.get("/jobs", validate(v.listJobsQuerySchema, "query"), c.listJobs);
router.get("/jobs/:id", validate(v.idParamSchema, "params"), c.getJob);
router.patch(
  "/jobs/:id/status",
  validate(v.idParamSchema, "params"),
  validate(v.jobStatusSchema),
  c.updateJobStatus,
);
router.patch(
  "/jobs/:id/checklist",
  validate(v.idParamSchema, "params"),
  validate(v.checklistSchema),
  c.updateChecklist,
);

router.get("/requests/:id", validate(v.idParamSchema, "params"), c.getRequest);
router.patch(
  "/requests/:id",
  validate(v.idParamSchema, "params"),
  validate(v.updateRequestSchema),
  c.updateRequest,
);
router.get("/requests/:id/status", validate(v.idParamSchema, "params"), c.getStatus);
router.get("/requests/:id/approval", validate(v.idParamSchema, "params"), c.getApproval);
router.post(
  "/requests/:id/approve-payment",
  validate(v.idParamSchema, "params"),
  c.approveAndPay,
);
router.patch("/requests/:id/cancel", validate(v.idParamSchema, "params"), c.cancel);
router.post(
  "/requests/:id/simulate-progress",
  validate(v.idParamSchema, "params"),
  c.simulateProgress,
);

module.exports = router;
