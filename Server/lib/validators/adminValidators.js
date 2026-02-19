const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().allow('', null),
  lastName: Joi.string().allow('', null),
  role: Joi.string().valid('user', 'admin').default('user')
});

const updateRoleSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('user', 'admin').required()
});

module.exports = {
  createUserSchema,
  updateRoleSchema
};
