const Joi = require("joi");

exports.createRequestSchema = Joi.object({
  memberId: Joi.number().integer().required(),
  vehicleId: Joi.number().integer().required(),
  status: Joi.string(),
});

exports.requestStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Requested", "Accepted", "In Progress", "Upcoming", "Completed")
    .required(),
});
