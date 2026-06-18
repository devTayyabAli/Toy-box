const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(50).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(50).required(),
});
const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(50),
});
module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
