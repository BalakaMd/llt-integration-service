const weatherService = require('../services/weather.service');

const getForecast = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const forecast = await weatherService.getForecast(lat, lng);
    res.json({ data: forecast });
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({ error: 'Failed to get weather forecast' });
  }
};

module.exports = {
  getForecast,
};
