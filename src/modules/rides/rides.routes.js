const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const ridesController = require("./rides.controller");
const garageController = require("../garage/garage.controller");
const {
  updateVehicleStepSchema,
  vehicleIdParamSchema,
} = require("./rides.validation");
const {
  listVehiclesQuerySchema,
  garageOverviewQuerySchema,
  vehicleIdParamSchema: garageVehicleIdParamSchema,
  listRequestsQuerySchema,
  createGarageRequestSchema,
  togglePrioritySchema,
  requestCategoriesQuerySchema,
  updateHealthSchema,
  vehicleActionsQuerySchema,
  vehicleRequestsQuerySchema,
  requestIdParamSchema,
  vehicleDetailQuerySchema,
} = require("../garage/garage.validation");
/**
 * Unified /api/v1/vehicles — My Garage UI + Add Vehicle wizard.
 * /api/v1/garage/* remains as deprecated alias (same handlers).
 */

// —— My Garage (list, detail bundle, health, docs, requests) ——
router.get("/overview", validate(garageOverviewQuerySchema, "query"), garageController.getOverview);
router.get("/service-options", garageController.getServiceOptions);
router.get(
  "/requests/categories",
  validate(requestCategoriesQuerySchema, "query"),
  garageController.getRequestCategories,
);
router.get("/requests", validate(listRequestsQuerySchema, "query"), garageController.listRequests);
router.get(
  "/requests/:id",
  validate(requestIdParamSchema, "params"),
  garageController.getRequest,
);
router.post("/requests", validate(createGarageRequestSchema), garageController.createRequest);

// —— Add Vehicle wizard ——
router.get("/wizard/schema", ridesController.getWizardSchema);

// List: default = My Garage. ?view=wizard = drafts for admin
router.get(
  "/",
  validate(listVehiclesQuerySchema, "query"),
  (req, res, next) => {
    if (req.query.view === "wizard") {
      return ridesController.getAll(req, res, next);
    }
    return garageController.listVehicles(req, res, next);
  },
);

router.post("/", (req, res) => {
  res.status(403).json({
    success: false,
    message: "Vehicle add is admin-only. Use sourcing request flow.",
    timestamp: new Date().toISOString(),
  });
});

router.get(
  "/:id",
  validate(garageVehicleIdParamSchema, "params"),
  validate(vehicleDetailQuerySchema, "query"),
  (req, res, next) => {
    if (req.query.view === "wizard") {
      return ridesController.getById(req, res, next);
    }
    return garageController.getVehicleDetails(req, res, next);
  },
);

router.patch(
  "/:id",
  validate(vehicleIdParamSchema, "params"),
  validate(updateVehicleStepSchema),
  ridesController.update,
);

router.get(
  "/:id/actions",
  validate(garageVehicleIdParamSchema, "params"),
  validate(vehicleActionsQuerySchema, "query"),
  garageController.getVehicleActions,
);

router.get(
  "/:id/health-report",
  validate(garageVehicleIdParamSchema, "params"),
  garageController.getHealthReport,
);

router.patch(
  "/:id/health",
  validate(garageVehicleIdParamSchema, "params"),
  validate(updateHealthSchema),
  garageController.updateHealth,
);

router.get(
  "/:id/specs",
  validate(garageVehicleIdParamSchema, "params"),
  garageController.getSpecs,
);

router.get(
  "/:id/documents",
  validate(garageVehicleIdParamSchema, "params"),
  garageController.getDocuments,
);

router.get(
  "/:id/requests",
  validate(garageVehicleIdParamSchema, "params"),
  validate(vehicleRequestsQuerySchema, "query"),
  garageController.getVehicleRequests,
);

router.patch(
  "/:id/priority",
  validate(garageVehicleIdParamSchema, "params"),
  validate(togglePrioritySchema),
  garageController.togglePriority,
);

router.delete(
  "/:id",
  validate(vehicleIdParamSchema, "params"),
  ridesController.remove,
);

module.exports = router;
