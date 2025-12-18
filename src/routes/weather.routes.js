const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const validate = require('../middlewares/validate');
const { forecastByCitySchema } = require('../validators/weatherValidators');

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
 *       - in: query
 *         name: start_date
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *           example: '2024-01-15'
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *           example: '2024-01-18'
 *         description: End date filter (YYYY-MM-DD)
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
