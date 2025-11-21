const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must contain valid characters",
    }),
});

module.exports = {
  loginSchema,
  resetPasswordSchema,
};
