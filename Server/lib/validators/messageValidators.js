const Joi = require("joi");

const getMessagesSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Recipient ID is required",
  }),
});

const searchMessagesSchema = Joi.object({
  chatId: Joi.string().required(),
  query: Joi.string().min(1).required(),
});

module.exports = {
  getMessagesSchema,
  searchMessagesSchema,
};
