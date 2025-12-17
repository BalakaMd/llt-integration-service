const googleMapsClient = require('../utils/googleMapsClient');
const { redisClient } = require('../utils/redisClient');

const CACHE_TTL = 86400; // 24 hours

const normalizePlace = place => ({
  external_ref: place.place_id,
  name: place.name || place.formatted_address,
  lat: place.geometry.location.lat,
  lng: place.geometry.location.lng,
  address: place.formatted_address,
  rating: place.rating || null,
  categories: place.types || [],
  photo_ref:
    place.photos && place.photos.length > 0
      ? place.photos[0].photo_reference
      : null,
});

// Step 1: Check Redis cache for existing results
// Step 2: If no cache - fetch from Google Places API
// Step 3: Normalize response to internal format
// Step 4: Save to Redis cache (24h TTL) and return
const searchPlaces = async query => {
  const cacheKey = `maps:search:${query}`;

  // Check Redis cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from Google Places API
  const response = await googleMapsClient.textSearch({
    params: {
      query,
      key: process.env.GOOGLE_MAPS_API_KEY,
      language: 'en',
    },
  });

  // Transform Google format to internal POI format
  const places = response.data.results.map(normalizePlace);

  // Cache for 24 hours (Google allows caching place_id up to 30 days)
  await redisClient.set(cacheKey, JSON.stringify(places), { EX: CACHE_TTL });

  return places;
};

// Step 1: Check Redis cache
// Step 2: If no cache - fetch coordinates from Google Geocoding API
// Step 3: Extract lat/lng and formatted address
// Step 4: Save to cache and return
const geocode = async address => {
  const cacheKey = `maps:geocode:${address}`;

  // Check cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from Google Geocoding API
  const response = await googleMapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  // Return null if address not found
  if (!response.data.results.length) {
    return null;
  }

  // Extract coordinates and formatted address
  const result = response.data.results[0];
  const location = {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formatted_address: result.formatted_address,
  };

  // Cache for 24 hours
  await redisClient.set(cacheKey, JSON.stringify(location), { EX: CACHE_TTL });

  return location;
};

module.exports = {
  searchPlaces,
  geocode,
};
