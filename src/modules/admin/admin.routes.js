"use strict";

const express = require("express");
const multer = require("multer");
const authenticate = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/requireRole.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const inventoryController = require("./inventory/inventory.controller");
const fleetController = require("./fleet/fleet.controller");
const membersController = require("./members/members.controller");
const adminStaffController = require("./staff/staff.controller");
const adminSourcingController = require("./adminSourcing.controller");
const inventoryValidation = require("./inventory/inventory.validation");
const fleetValidation = require("./fleet/fleet.validation");
const membersValidation = require("./members/members.validation");
const adminStaffValidation = require("./staff/staff.validation");
const adminValidation = require("./admin.validation");
const chatController = require("../chat/chat.controller");
const chatValidation = require("../chat/chat.validation");
const { parseAdminInventoryMultipart } = require("./inventory/inventory.multipart");
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

router.use(authenticate, requireRole("admin", "staff"));

router.get(
  "/members/summary",
  membersController.getSummary,
);
router.get(
  "/members",
  validate(membersValidation.membersListQuerySchema, "query"),
  membersController.list,
);
router.post(
  "/members/invite",
  validate(membersValidation.adminInviteMemberSchema),
  membersController.invite,
);
router.get(
  "/members/:id",
  validate(membersValidation.memberIdParamSchema, "params"),
  membersController.getById,
);

router.get("/staff/summary", adminStaffController.getSummary);
router.get(
  "/staff",
  validate(adminStaffValidation.staffListQuerySchema, "query"),
  adminStaffController.list,
);
router.post(
  "/staff/invite",
  requireRole("admin"),
  validate(adminStaffValidation.adminInviteStaffSchema),
  adminStaffController.invite,
);
router.get(
  "/staff/:id",
  validate(adminStaffValidation.staffIdParamSchema, "params"),
  adminStaffController.getById,
);

/**
 * Admin & staff panel routes (`/api/v1/admin/*`).
 * Invitations remain admin-only under `/api/v1/auth/invitations`.
 */

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
router.get(
  "/vehicles/:id",
  validate(fleetValidation.fleetIdParamSchema, "params"),
  fleetController.getById,
);

router.get(
  "/sourcing/requests",
  validate(adminValidation.adminListQuerySchema, "query"),
  adminSourcingController.listRequests,
);
router.get(
  "/sourcing/summary",
  adminSourcingController.getSummary,
);
router.get(
  "/sourcing/requests/:id/offer-options",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  adminSourcingController.getOfferOptions,
);
router.get(
  "/sourcing/requests/:id",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  adminSourcingController.getRequest,
);
router.get(
  "/sourcing/requests/:id/assignments",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  adminSourcingController.listAssignments,
);
router.post(
  "/sourcing/requests/:id/assign",
  validate(adminValidation.sourcingIdParamSchema, "params"),
  validate(adminValidation.assignVehicleSchema),
  adminSourcingController.assignVehicle,
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
