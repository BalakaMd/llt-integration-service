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

const getForecastByCity = async (req, res) => {
  try {
    const { city } = req.query;
    const result = await weatherService.getForecastByCity(city);

    if (!result) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Weather by city error:', error.message);
    res.status(500).json({ error: 'Failed to get weather forecast' });
  }
};

module.exports = {
  getForecast,
  getForecastByCity,
};
