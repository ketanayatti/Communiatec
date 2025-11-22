const Joi = require("joi");

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required().messages({
    "string.min": "First name must be at least 1 character long",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    "string.min": "Last name must be at least 1 character long",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
}).unknown(true);

module.exports = {
  updateProfileSchema,
};
