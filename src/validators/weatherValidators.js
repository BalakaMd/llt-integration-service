const Joi = require('joi');

const forecastSchema = Joi.object({
  lat: Joi.number().required().min(-90).max(90),
  lng: Joi.number().required().min(-180).max(180),
});

const forecastByCitySchema = Joi.object({
  city: Joi.string().required().min(1).max(200),
});

module.exports = {
  forecastSchema,
  forecastByCitySchema,
};
