const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const validate = require('../middlewares/validate');
const { forecastSchema } = require('../validators/weatherValidators');

router.get('/', validate(forecastSchema), weatherController.getForecast);

module.exports = router;
