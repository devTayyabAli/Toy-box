"use strict";

const express = require("express");
const multer = require("multer");
const authenticate = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/requireRole.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const staffController = require("./staff.controller");
const staffSourcingController = require("./sourcing/staffSourcing.controller");
const inventoryController = require("../admin/inventory/inventory.controller");
const fleetController = require("../admin/fleet/fleet.controller");
const chatController = require("../chat/chat.controller");
const adminValidation = require("../admin/admin.validation");
const inventoryValidation = require("../admin/inventory/inventory.validation");
const fleetValidation = require("../admin/fleet/fleet.validation");
const chatValidation = require("../chat/chat.validation");
const { parseAdminInventoryMultipart } = require("../admin/inventory/inventory.multipart");
const { DOCUMENT_TYPES } = require("../rides/rides.mapper");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const inventoryDocumentFields = [
  ...DOCUMENT_TYPES.map((name) => ({ name, maxCount: 1 })),
  { name: "vehicleImage", maxCount: 1 },
];

router.use(authenticate, requireRole("staff", "admin"));

router.get("/overview", staffController.getOverview);

router.get(
  "/vehicles",
  validate(fleetValidation.fleetListQuerySchema, "query"),
  fleetController.list,
);
router.get("/vehicles/inventory/wizard/schema", inventoryController.getWizardSchema);
router.post(
  "/vehicles/inventory",
  upload.fields(inventoryDocumentFields),
  parseAdminInventoryMultipart,
  validate(inventoryValidation.createInventorySchema),
  inventoryController.create,
);
router.get(
  "/vehicles/inventory",
  validate(inventoryValidation.inventoryListQuerySchema, "query"),
  inventoryController.list,
);
router.get(
  "/vehicles/inventory/:id",
  validate(inventoryValidation.inventoryIdParamSchema, "params"),
  inventoryController.getById,
);
router.patch(
  "/vehicles/inventory/:id",
  upload.fields(inventoryDocumentFields),
  parseAdminInventoryMultipart,
  validate(inventoryValidation.inventoryIdParamSchema, "params"),
  validate(inventoryValidation.updateInventorySchema),
  inventoryController.update,
);
router.delete(
  "/vehicles/inventory/:id",
  validate(inventoryValidation.inventoryIdParamSchema, "params"),
  inventoryController.remove,
);

router.get("/sourcing/summary", staffSourcingController.getSummary);
router.get(
  "/sourcing/requests",
  validate(adminValidation.adminListQuerySchema, "query"),
  staffSourcingController.listRequests,
);
router.get(
  "/sourcing/requests/:id/offer-options",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.getOfferOptions,
);
router.get(
  "/sourcing/requests/:id",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.getRequest,
);
router.get(
  "/sourcing/requests/:id/assignments",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.listAssignments,
);
router.post(
  "/sourcing/requests/:id/assign",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  validate(adminValidation.assignVehicleSchema),
  staffSourcingController.assignVehicle,
);

router.get("/confirmations/summary", staffSourcingController.getSummary);
router.get(
  "/confirmations",
  validate(adminValidation.adminListQuerySchema, "query"),
  staffSourcingController.listRequests,
);
router.get(
  "/confirmations/:id/offer-options",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.getOfferOptions,
);
router.get(
  "/confirmations/:id",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.getRequest,
);
router.get(
  "/confirmations/:id/assignments",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  staffSourcingController.listAssignments,
);
router.post(
  "/confirmations/:id/offer",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  validate(adminValidation.assignVehicleSchema),
  staffSourcingController.assignVehicle,
);

router.post(
  "/chat/initiate",
  validate(chatValidation.adminInitiateSchema),
  chatController.adminInitiate,
);
router.get(
  "/chat/conversations",
  validate(chatValidation.adminListQuerySchema, "query"),
  chatController.adminListConversations,
);
router.get(
  "/chat/:memberId/messages",
  validate(chatValidation.memberIdParamSchema, "params"),
  validate(chatValidation.listQuerySchema, "query"),
  chatController.adminGetConversation,
);
router.post(
  "/chat/:memberId/messages",
  validate(chatValidation.memberIdParamSchema, "params"),
  validate(chatValidation.adminSendSchema),
  chatController.adminSendMessage,
);
router.patch(
  "/chat/:memberId/read",
  validate(chatValidation.memberIdParamSchema, "params"),
  chatController.adminMarkRead,
);

module.exports = router;
