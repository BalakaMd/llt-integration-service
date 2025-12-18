const mapsService = require('../services/maps.service');

const search = async (req, res) => {
  try {
    const { q } = req.query;
    const places = await mapsService.searchPlaces(q);
    res.json({ data: places });
  } catch (error) {
    console.error('Maps search error:', error.message);
    res.status(500).json({ error: 'Failed to search places' });
  }
};

const geocode = async (req, res) => {
  try {
    const { address } = req.query;
    const location = await mapsService.geocode(address);

    if (!location) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ data: location });
  } catch (error) {
    console.error('Geocode error:', error.message);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
};

const searchPois = async (req, res) => {
  try {
    const { city, interests } = req.body;
    const pois = await mapsService.searchPois(city, interests);
    res.json({ data: pois });
  } catch (error) {
    console.error('POI search error:', error.message);
    res.status(500).json({ error: 'Failed to search POIs' });
  }
};

const getCityInfo = async (req, res) => {
  try {
    const { city } = req.query;
    const info = await mapsService.getCityInfo(city);

    if (!info) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json({ data: info });
  } catch (error) {
    console.error('City info error:', error.message);
    res.status(500).json({ error: 'Failed to get city info' });
  }
};

module.exports = {
  search,
  geocode,
  searchPois,
  getCityInfo,
};
