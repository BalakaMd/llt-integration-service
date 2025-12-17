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

module.exports = {
  search,
  geocode,
};
