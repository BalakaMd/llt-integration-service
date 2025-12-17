const Joi = require('joi');

const userIdQuerySchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

const callbackSchema = Joi.object({
  code: Joi.string().required(),
  state: Joi.string().uuid().required(),
});

const createEventSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  title: Joi.string().required().min(1).max(200),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  description: Joi.string().max(1000).allow('', null),
});

module.exports = {
  userIdQuerySchema,
  callbackSchema,
  createEventSchema,
};
