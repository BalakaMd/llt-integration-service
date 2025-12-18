const Joi = require('joi');

const searchSchema = Joi.object({
  q: Joi.string().required().min(1).max(200),
});

const geocodeSchema = Joi.object({
  address: Joi.string().required().min(1).max(500),
});

const searchPoisSchema = Joi.object({
  city: Joi.string().required().min(1).max(200),
  interests: Joi.array().items(Joi.string()).min(1).required(),
});

const cityInfoSchema = Joi.object({
  city: Joi.string().required().min(1).max(200),
});

module.exports = {
  searchSchema,
  geocodeSchema,
  searchPoisSchema,
  cityInfoSchema,
};
