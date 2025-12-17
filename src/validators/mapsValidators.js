const Joi = require('joi');

const searchSchema = Joi.object({
  q: Joi.string().required().min(1).max(200),
});

const geocodeSchema = Joi.object({
  address: Joi.string().required().min(1).max(500),
});

module.exports = {
  searchSchema,
  geocodeSchema,
};
