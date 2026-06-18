const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validatePayload = require("../middlewares/validatePayload.middleware");
const {
  createBookingSchema,
  updateBookingSchema,
} = require("../validators/booking.validator");
const BookingController = require("../controllers/booking.controller");

router.use(authenticate);

router.post(
  "/bookings",
  validatePayload(createBookingSchema),
  BookingController.create.bind(BookingController),
);

router.get("/bookings", BookingController.list.bind(BookingController));
router.get("/bookings/:id", BookingController.getById.bind(BookingController));

router.put(
  "/bookings/:id",
  validatePayload(updateBookingSchema),
  BookingController.update.bind(BookingController),
);

router.delete("/bookings/:id", BookingController.remove.bind(BookingController));

module.exports = router;
