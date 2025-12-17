const axios = require('axios');
const { redisClient } = require('../utils/redisClient');
const { WeatherCache } = require('../models');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const CACHE_TTL = 10800; // 3 hours

const getMode = array => {
  const frequency = {};
  let maxFreq = 0;
  let mode = array[0];

  for (const item of array) {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mode = item;
    }
  }

  return mode;
};

// Step 1: Round coordinates to 2 decimal places for better cache hits
// Step 2: Check Redis cache (fast, in-memory)
// Step 3: Check PostgreSQL cache (persistent, survives Redis restart)
// Step 4: If no cache - fetch from OpenWeatherMap API
// Step 5: Aggregate 3-hour intervals into daily summaries
// Step 6: Save to both caches and return result
const getForecast = async (lat, lng) => {
  // Round coordinates - small differences don't affect weather
  const latRound = parseFloat(lat).toFixed(2);
  const lngRound = parseFloat(lng).toFixed(2);
  const queryHash = `weather:${latRound}:${lngRound}`;

  // Check Redis first (fastest)
  const cachedRedis = await redisClient.get(queryHash);
  if (cachedRedis) {
    return JSON.parse(cachedRedis);
  }

  // Check PostgreSQL if Redis is empty
  const cachedDb = await WeatherCache.findByPk(queryHash);
  if (cachedDb && new Date() - cachedDb.fetched_at < CACHE_TTL * 1000) {
    // Warm up Redis with data from DB
    await redisClient.set(queryHash, JSON.stringify(cachedDb.payload), {
      EX: CACHE_TTL,
    });
    return cachedDb.payload;
  }

  // Fetch fresh data from OpenWeatherMap
  const response = await axios.get(BASE_URL, {
    params: {
      lat,
      lon: lng,
      units: 'metric',
      lang: 'en',
      appid: process.env.OPENWEATHER_API_KEY,
    },
  });

  // API returns 40 items (5 days x 8 three-hour intervals)
  // Group them by date
  const rawData = response.data;
  const dailySummary = {};

  rawData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];

    if (!dailySummary[date]) {
      dailySummary[date] = {
        temps: [],
        conditions: [],
        icons: [],
      };
    }

    dailySummary[date].temps.push(item.main.temp);
    dailySummary[date].conditions.push(item.weather[0].description);
    dailySummary[date].icons.push(item.weather[0].icon);
  });

  // Calculate min/max temp and most frequent condition per day
  const normalizedForecast = Object.keys(dailySummary)
    .map(date => {
      const dayData = dailySummary[date];
      return {
        date,
        temp_min: Math.min(...dayData.temps),
        temp_max: Math.max(...dayData.temps),
        summary: getMode(dayData.conditions),
        icon: getMode(dayData.icons),
      };
    })
    .slice(0, 5);

  // Save to PostgreSQL (persistent)
  await WeatherCache.upsert({
    query_hash: queryHash,
    payload: normalizedForecast,
    fetched_at: new Date(),
  });

  // Save to Redis (fast access)
  await redisClient.set(queryHash, JSON.stringify(normalizedForecast), {
    EX: CACHE_TTL,
  });

  return normalizedForecast;
};

module.exports = {
  getForecast,
};
