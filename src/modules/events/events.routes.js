const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth.middleware");
const { optionalAuthenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const eventsController = require("./events.controller");
const {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  rsvpBodySchema,
  patchRsvpBodySchema,
  listQuerySchema,
  joinBodySchema,
  diaryQuerySchema,
} = require("./events.validation");

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: List events with filters
 *     description: |
 *       Flat list (default) or grouped feed (`grouped=true`) matching Featured / This week / Next month.
 *       Filter by `category`, `isFeatured`, and search `q` on title or location.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, drives, auctions, dining, track]
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: string
 *           enum: ["true", "false", "1", "0"]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: grouped
 *         description: When true, returns featured, thisWeek, and nextMonth arrays
 *         schema:
 *           type: string
 *           enum: ["true", "1"]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: refDate
 *         description: ISO reference date for week/month windows (optional)
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Event list or grouped sections
 *       400:
 *         description: Invalid filters
 */
/**
 * @swagger
 * /api/v1/events/my-diary:
 *   get:
 *     summary: My diary — events I joined (RSVP)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grouped
 *         schema: { type: string, enum: ["true", "1"] }
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [all, drives, auctions, dining, track] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Joined events only (myRsvp on each row)
 */
router.get(
  "/my-diary",
  authenticate,
  validate(diaryQuerySchema, "query"),
  eventsController.myDiary,
);

router.get("/", optionalAuthenticate, validate(listQuerySchema, "query"), eventsController.list);

/**
 * @swagger
 * /api/v1/events/{id}/join:
 *   post:
 *     summary: Join event (adds to my diary)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFavorite: { type: boolean }
 *     responses:
 *       201:
 *         description: Joined — event appears in GET /api/v1/events/my-diary
 */
router.post(
  "/:id/join",
  authenticate,
  validate(eventIdParamSchema, "params"),
  validate(joinBodySchema),
  eventsController.join,
);

/**
 * @swagger
 * /api/v1/events/{id}/leave:
 *   delete:
 *     summary: Leave event (remove from my diary)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id/leave",
  authenticate,
  validate(eventIdParamSchema, "params"),
  eventsController.leave,
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by id
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: memberId
 *         schema: { type: integer }
 *         description: Optional — includes isJoined and myRsvp for this member
 *     responses:
 *       200:
 *         description: Event with attendingCount, spotsRemaining, isJoined
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  optionalAuthenticate,
  validate(eventIdParamSchema, "params"),
  eventsController.getById,
);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", validate(createEventSchema), eventsController.create);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   patch:
 *     summary: Update event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.patch("/:id", validate(eventIdParamSchema, "params"), validate(updateEventSchema), eventsController.update);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", validate(eventIdParamSchema, "params"), eventsController.remove);

/**
 * @swagger
 * /api/v1/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: RSVP created; returns updated event
 *       400:
 *         description: At capacity
 *       404:
 *         description: Event or member not found
 *       409:
 *         description: Already RSVPed
 */
router.post(
  "/:id/rsvp",
  validate(eventIdParamSchema, "params"),
  validate(rsvpBodySchema),
  eventsController.rsvp,
);

/**
 * @swagger
 * /api/v1/events/{id}/rsvp:
 *   patch:
 *     summary: Update RSVP flags for a member (e.g. favorite)
 *     description: Requires an existing RSVP; does not create one.
 *     tags: [Events]
 */
router.patch(
  "/:id/rsvp",
  validate(eventIdParamSchema, "params"),
  validate(patchRsvpBodySchema),
  eventsController.patchRsvp,
);

/**
 * @swagger
 * /api/v1/events/{id}/rsvp:
 *   delete:
 *     summary: Cancel RSVP
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: integer
 */
router.delete(
  "/:id/rsvp",
  validate(eventIdParamSchema, "params"),
  validate(rsvpBodySchema),
  eventsController.cancelRsvp,
);

module.exports = router;
