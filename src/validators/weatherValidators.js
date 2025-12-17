const Joi = require('joi');

const forecastSchema = Joi.object({
  lat: Joi.number().required().min(-90).max(90),
  lng: Joi.number().required().min(-180).max(180),
});

module.exports = {
  forecastSchema,
};
