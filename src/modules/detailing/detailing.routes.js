const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const detailingController = require("./detailing.controller");
const {
  estimateSchema,
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamSchema,
  listBookingsQuerySchema,
} = require("./detailing.validation");

/**
 * @swagger
 * /api/v1/detailing/catalog:
 *   get:
 *     summary: Packages and add-ons for Detailing & Wash screen
 *     tags: [Detailing]
 */
router.get("/catalog", detailingController.getCatalog);

router.get("/packages", detailingController.getPackages);
router.get("/add-ons", detailingController.getAddons);
router.get("/locations", detailingController.getLocations);

/**
 * @swagger
 * /api/v1/detailing/estimate:
 *   post:
 *     summary: Calculate total estimate (review screen)
 *     tags: [Detailing]
 */
router.post("/estimate", validate(estimateSchema), detailingController.estimate);

/**
 * @swagger
 * /api/v1/detailing/review:
 *   post:
 *     summary: Build review summary payload before confirm
 *     tags: [Detailing]
 */
router.post("/review", validate(estimateSchema), detailingController.review);

/**
 * @swagger
 * /api/v1/detailing/bookings:
 *   post:
 *     summary: Confirm and submit detailing booking
 *     tags: [Detailing]
 */
router.get(
  "/bookings",
  validate(listBookingsQuerySchema, "query"),
  detailingController.listBookings,
);
router.post("/bookings", validate(createBookingSchema), detailingController.createBooking);

/**
 * @swagger
 * /api/v1/detailing/bookings/{id}:
 *   get:
 *     summary: Booking confirmation and summary
 *     tags: [Detailing]
 */
router.get(
  "/bookings/:id",
  validate(bookingIdParamSchema, "params"),
  detailingController.getBooking,
);

router.patch(
  "/bookings/:id",
  validate(bookingIdParamSchema, "params"),
  validate(updateBookingSchema),
  detailingController.updateBooking,
);

/**
 * @swagger
 * /api/v1/detailing/bookings/{id}/progress:
 *   get:
 *     summary: Live booking status timeline
 *     tags: [Detailing]
 */
router.get(
  "/bookings/:id/progress",
  validate(bookingIdParamSchema, "params"),
  detailingController.getProgress,
);

/**
 * @swagger
 * /api/v1/detailing/bookings/{id}/job-detail:
 *   get:
 *     summary: Completed job report and checklist
 *     tags: [Detailing]
 */
router.get(
  "/bookings/:id/job-detail",
  validate(bookingIdParamSchema, "params"),
  detailingController.getJobDetail,
);

/**
 * @swagger
 * /api/v1/detailing/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Detailing]
 */
router.patch(
  "/bookings/:id/cancel",
  validate(bookingIdParamSchema, "params"),
  detailingController.cancelBooking,
);

/**
 * @swagger
 * /api/v1/detailing/bookings/{id}/simulate-progress:
 *   post:
 *     summary: Advance timeline (dev/demo for UI testing)
 *     tags: [Detailing]
 */
router.post(
  "/bookings/:id/simulate-progress",
  validate(bookingIdParamSchema, "params"),
  detailingController.simulateProgress,
);

module.exports = router;
