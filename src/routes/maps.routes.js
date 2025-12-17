const express = require('express');
const router = express.Router();
const mapsController = require('../controllers/maps.controller');
const validate = require('../middlewares/validate');
const { searchSchema, geocodeSchema } = require('../validators/mapsValidators');

router.get('/search', validate(searchSchema), mapsController.search);
router.get('/geocode', validate(geocodeSchema), mapsController.geocode);

module.exports = router;
