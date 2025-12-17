const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const validate = require('../middlewares/validate');
const { forecastSchema } = require('../validators/weatherValidators');

/**
 * @swagger
 * /weather:
 *   get:
 *     tags: [Weather]
 *     summary: Get 5-day weather forecast
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude (-90 to 90)
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude (-180 to 180)
 *     responses:
 *       200:
 *         description: Daily weather forecast
 *       400:
 *         description: Validation error
 */
router.get('/', validate(forecastSchema), weatherController.getForecast);

module.exports = router;
