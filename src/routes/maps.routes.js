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
 *           example: restaurants in Paris
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of places
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - place_id: ChIJD7fiBh9u5kcRYJSMaMOCCwQ
 *                   name: Le Petit Cler
 *                   address: 29 Rue Cler, 75007 Paris
 *                   location:
 *                     lat: 48.8566
 *                     lng: 2.3522
 *                   rating: 4.5
 *                   types:
 *                     - restaurant
 *                     - food
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
 *           example: Eiffel Tower, Paris
 *         description: Address to geocode
 *     responses:
 *       200:
 *         description: Location coordinates
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 lat: 48.8584
 *                 lng: 2.2945
 *                 formatted_address: Champ de Mars, 5 Av. Anatole France, 75007 Paris, France
 *       404:
 *         description: Address not found
 */
router.get('/geocode', validate(geocodeSchema), mapsController.geocode);

module.exports = router;
