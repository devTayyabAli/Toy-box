const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const garageController = require("./garage.controller");
const {
  listVehiclesQuerySchema,
  garageOverviewQuerySchema,
  vehicleIdParamSchema,
  listRequestsQuerySchema,
  createGarageRequestSchema,
  togglePrioritySchema,
  requestCategoriesQuerySchema,
  updateHealthSchema,
  vehicleActionsQuerySchema,
  vehicleRequestsQuerySchema,
  requestIdParamSchema,
} = require("./garage.validation");

/** @swagger tags: [Garage] */

/**
 * @swagger
 * /api/v1/garage/overview:
 *   get:
 *     summary: My Garage screen (Figma-aligned payload)
 *     tags: [Garage]
 *     parameters:
 *       - in: query
 *         name: memberId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, priority, mine], default: mine }
 *       - in: query
 *         name: selectedVehicleId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: title, summaryLabel, featuredVehicle, vehicles (status per vehicle)
 */
router.get("/overview", validate(garageOverviewQuerySchema, "query"), garageController.getOverview);

router.get(
  "/vehicles",
  validate(listVehiclesQuerySchema, "query"),
  garageController.listVehicles,
);

router.get("/service-options", garageController.getServiceOptions);

router.get(
  "/requests/categories",
  validate(requestCategoriesQuerySchema, "query"),
  garageController.getRequestCategories,
);

router.get(
  "/requests",
  validate(listRequestsQuerySchema, "query"),
  garageController.listRequests,
);

router.get(
  "/requests/:id",
  validate(requestIdParamSchema, "params"),
  garageController.getRequest,
);

router.post("/requests", validate(createGarageRequestSchema), garageController.createRequest);

router.get(
  "/vehicles/:id",
  validate(vehicleIdParamSchema, "params"),
  garageController.getVehicleDetails,
);

router.get(
  "/vehicles/:id/actions",
  validate(vehicleIdParamSchema, "params"),
  validate(vehicleActionsQuerySchema, "query"),
  garageController.getVehicleActions,
);

router.get(
  "/vehicles/:id/health-report",
  validate(vehicleIdParamSchema, "params"),
  garageController.getHealthReport,
);

router.patch(
  "/vehicles/:id/health",
  validate(vehicleIdParamSchema, "params"),
  validate(updateHealthSchema),
  garageController.updateHealth,
);

router.get(
  "/vehicles/:id/specs",
  validate(vehicleIdParamSchema, "params"),
  garageController.getSpecs,
);

router.get(
  "/vehicles/:id/documents",
  validate(vehicleIdParamSchema, "params"),
  garageController.getDocuments,
);

router.get(
  "/vehicles/:id/requests",
  validate(vehicleIdParamSchema, "params"),
  validate(vehicleRequestsQuerySchema, "query"),
  garageController.getVehicleRequests,
);

router.patch(
  "/vehicles/:id/priority",
  validate(vehicleIdParamSchema, "params"),
  validate(togglePrioritySchema),
  garageController.togglePriority,
);

module.exports = router;
