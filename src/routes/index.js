const express = require('express');
const router = express.Router();

const mapsRoutes = require('./maps.routes');
const weatherRoutes = require('./weather.routes');
const calendarRoutes = require('./calendar.routes');

router.use('/maps', mapsRoutes);
router.use('/weather', weatherRoutes);
router.use('/calendar', calendarRoutes);

module.exports = router;
