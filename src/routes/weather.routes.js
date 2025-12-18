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
 *           example: 48.85
 *         description: Latitude (-90 to 90)
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           example: 2.35
 *         description: Longitude (-180 to 180)
 *     responses:
 *       200:
 *         description: Daily weather forecast
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - date: '2024-01-15'
 *                   temp_min: 5.2
 *                   temp_max: 12.8
 *                   summary: light rain
 *                   icon: 10d
 *                 - date: '2024-01-16'
 *                   temp_min: 3.1
 *                   temp_max: 9.5
 *                   summary: clear sky
 *                   icon: 01d
 *       400:
 *         description: Validation error
 */
router.get('/', validate(forecastSchema), weatherController.getForecast);

module.exports = router;
