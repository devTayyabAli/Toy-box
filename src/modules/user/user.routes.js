const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const userController = require("./user.controller");
const { createUserSchema } = require("./user.validation");
const { memberDiaryParamSchema, listQuerySchema } = require("../events/events.validation");

/**
 * @swagger
 * /api/v1/members:
 *   get:
 *     summary: List all members
 *     description: Returns every `Member` row from the database (no pagination or auth in this version).
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessMembers'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", userController.getAll);

/**
 * @swagger
 * /api/v1/members/{memberId}/diary:
 *   get:
 *     summary: Member diary (RSVP'd events only)
 *     description: |
 *       Same `Event` + `EventRsvp` data as the main events API — not a new domain model.
 *       Returns only events this member has RSVP'd to. Use `myRsvp.isFavorite` for starred items;
 *       use `PATCH /api/v1/events/{id}/rsvp` to toggle favorite after RSVPing.
 *     tags: [Members]
 */
router.get(
  "/:memberId/diary",
  validate(memberDiaryParamSchema, "params"),
  validate(listQuerySchema, "query"),
  userController.getDiary,
);

/**
 * @swagger
 * /api/v1/members:
 *   post:
 *     summary: Register a member record
 *     description: Creates a `Member`. `email` must be unique.
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberCreate'
 *     responses:
 *       201:
 *         description: Member created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessMember'
 *       500:
 *         description: Server error (e.g. duplicate email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validate(createUserSchema), userController.create);

module.exports = router;
