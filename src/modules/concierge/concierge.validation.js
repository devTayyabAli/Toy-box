const Joi = require("joi");

exports.conciergeBodySchema = Joi.object().unknown(true);
