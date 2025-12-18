const express = require('express');
const router = express.Router();
const mapsController = require('../controllers/maps.controller');
const validate = require('../middlewares/validate');
const {
  searchPoisSchema,
  cityInfoSchema,
} = require('../validators/mapsValidators');

/**
 * @swagger
 * /maps/pois:
 *   post:
 *     tags: [Maps]
 *     summary: Search POIs by city and interests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - interests
 *             properties:
 *               city:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             city: Київ
 *             interests:
 *               - history
 *               - food
 *     responses:
 *       200:
 *         description: List of POIs
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - name: Софійський собор
 *                   lat: 50.4529
 *                   lng: 30.5143
 *                   rating: 4.9
 *                   category: history
 *                   city: Київ
 */
router.post(
  '/pois',
  validate(searchPoisSchema, 'body'),
  mapsController.searchPois,
);

/**
 * @swagger
 * /maps/city:
 *   get:
 *     tags: [Maps]
 *     summary: Get city information
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
 *         description: City information
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 name: Київ
 *                 name_en: Kyiv
 *                 coordinates:
 *                   lat: 50.4501
 *                   lng: 30.5234
 *                 country: Ukraine
 *       404:
 *         description: City not found
 */
router.get('/city', validate(cityInfoSchema), mapsController.getCityInfo);

module.exports = router;
