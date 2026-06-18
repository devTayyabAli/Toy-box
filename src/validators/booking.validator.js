const Joi = require("joi");

const createBookingSchema = Joi.object({
  customer: Joi.string().required(),
  vehicle: Joi.string().required(),
  pickupDate: Joi.date().required(),
  returnDate: Joi.date().required(),
  status: Joi.string().valid("booked", "ongoing", "completed", "cancelled"),
  paymentStatus: Joi.string().valid("pending", "paid", "partial"),
  notes: Joi.string().allow("", null),
});

const updateBookingSchema = Joi.object({
  customer: Joi.string(),
  vehicle: Joi.string(),
  pickupDate: Joi.date(),
  returnDate: Joi.date(),
  status: Joi.string().valid("booked", "ongoing", "completed", "cancelled"),
  paymentStatus: Joi.string().valid("pending", "paid", "partial"),
  notes: Joi.string().allow("", null),
}).min(1);

module.exports = {
  createBookingSchema,
  updateBookingSchema,
};
