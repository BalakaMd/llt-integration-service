const express = require('express');
const router = express.Router();
const mapsController = require('../controllers/maps.controller');
const validate = require('../middlewares/validate');
const { searchSchema, geocodeSchema } = require('../validators/mapsValidators');

/**
 * @swagger
 * /maps/search:
 *   get:
 *     tags: [Maps]
 *     summary: Search places by query
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (e.g., "restaurants in Paris")
 *     responses:
 *       200:
 *         description: List of places
 *       400:
 *         description: Validation error
 */
router.get('/search', validate(searchSchema), mapsController.search);

/**
 * @swagger
 * /maps/geocode:
 *   get:
 *     tags: [Maps]
 *     summary: Geocode an address to coordinates
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address to geocode
 *     responses:
 *       200:
 *         description: Location coordinates
 *       404:
 *         description: Address not found
 */
router.get('/geocode', validate(geocodeSchema), mapsController.geocode);

module.exports = router;
