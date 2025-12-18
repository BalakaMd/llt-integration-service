const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const validate = require('../middlewares/validate');
const {
  forecastSchema,
  forecastByCitySchema,
} = require('../validators/weatherValidators');

/**
 * @swagger
 * /weather:
 *   get:
 *     tags: [Weather]
 *     summary: Get 5-day weather forecast by coordinates
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
 *                   temp_min_c: 5.2
 *                   temp_max_c: 12.8
 *                   condition: light rain
 *                   icon: 10d
 *                   humidity_percent: 65
 *                   precipitation_chance: 40
 *       400:
 *         description: Validation error
 */
router.get('/', validate(forecastSchema), weatherController.getForecast);

/**
 * @swagger
 * /weather/city:
 *   get:
 *     tags: [Weather]
 *     summary: Get 5-day weather forecast by city name
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *           example: Київ
 *         description: City name
 *     responses:
 *       200:
 *         description: Weather forecast with city info
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 city: Київ
 *                 city_en: Kyiv
 *                 coordinates:
 *                   lat: 50.4501
 *                   lng: 30.5234
 *                 forecast:
 *                   - date: '2024-01-15'
 *                     temp_min_c: -2.5
 *                     temp_max_c: 3.8
 *                     condition: light snow
 *                     humidity_percent: 78
 *                     precipitation_chance: 60
 *       404:
 *         description: City not found
 */
router.get(
  '/city',
  validate(forecastByCitySchema),
  weatherController.getForecastByCity,
);

module.exports = router;
