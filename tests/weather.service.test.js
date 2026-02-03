jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('../src/utils/redisClient', () => {
  return {
    redisClient: {
      get: jest.fn(),
      set: jest.fn(),
    },
  };
});

jest.mock('../src/models', () => {
  return {
    WeatherCache: {
      findByPk: jest.fn(),
      upsert: jest.fn(),
    },
  };
});

const axios = require('axios');
const { redisClient } = require('../src/utils/redisClient');
const { WeatherCache } = require('../src/models');

const weatherService = require('../src/services/weather.service');

describe('weather.service', () => {
  beforeEach(() => {
    axios.get.mockReset();
    redisClient.get.mockReset();
    redisClient.set.mockReset();
    WeatherCache.findByPk.mockReset();
    WeatherCache.upsert.mockReset();
  });

  test('getForecast: returns cached from Redis when present', async () => {
    const cached = [{ date: '2025-12-18', temp_min_c: 1, temp_max_c: 2 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const result = await weatherService.getForecast(50.451, 30.521);

    expect(result).toEqual(cached);
    expect(WeatherCache.findByPk).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('getForecast: returns cached from DB when Redis miss and DB fresh', async () => {
    redisClient.get.mockResolvedValue(null);

    const payload = [{ date: '2025-12-18', temp_min_c: 1, temp_max_c: 2 }];
    WeatherCache.findByPk.mockResolvedValue({
      payload,
      fetched_at: new Date(Date.now() - 60 * 1000),
    });

    const result = await weatherService.getForecast(50.451, 30.521);

    expect(result).toEqual(payload);
    expect(redisClient.set).toHaveBeenCalledTimes(1);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('getForecast: fetches from API, normalizes and caches when no cache', async () => {
    redisClient.get.mockResolvedValue(null);
    WeatherCache.findByPk.mockResolvedValue(null);

    // Build minimal raw list for two days
    const raw = {
      list: [
        {
          dt_txt: '2025-12-18 00:00:00',
          main: { temp: 1.11, humidity: 70 },
          weather: [{ description: 'clear sky', icon: '01d' }],
          pop: 0.1,
        },
        {
          dt_txt: '2025-12-18 03:00:00',
          main: { temp: 2.22, humidity: 80 },
          weather: [{ description: 'clear sky', icon: '01d' }],
          pop: 0.4,
        },
        {
          dt_txt: '2025-12-19 00:00:00',
          main: { temp: 3.33, humidity: 60 },
          weather: [{ description: 'rain', icon: '09d' }],
          pop: 0.25,
        },
      ],
    };

    axios.get.mockResolvedValue({ data: raw });

    const result = await weatherService.getForecast(50.45, 30.52);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toEqual(
      expect.objectContaining({
        date: '2025-12-18',
        temp_min_c: 1.1,
        temp_max_c: 2.2,
        condition: 'clear sky',
        icon: '01d',
        humidity_percent: 75,
        precipitation_chance: 40,
      }),
    );

    expect(WeatherCache.upsert).toHaveBeenCalledTimes(1);
    expect(redisClient.set).toHaveBeenCalledTimes(1);
  });

  test('getForecastByCity: returns null when geocode returns null', async () => {
    jest.resetModules();

    jest.doMock('../src/services/maps.service', () => ({
      geocode: jest.fn().mockResolvedValue(null),
    }));

    // Re-require after doMock
    const service = require('../src/services/weather.service');

    const result = await service.getForecastByCity('Nowhere');
    expect(result).toBeNull();
  });

  test('getForecastByCity: filters by date range', async () => {
    jest.resetModules();

    jest.doMock('../src/services/maps.service', () => ({
      geocode: jest.fn().mockResolvedValue({
        lat: 50.45,
        lng: 30.52,
        formatted_address: 'Kyiv, Ukraine',
      }),
    }));

    jest.doMock('axios', () => ({
      get: jest.fn().mockResolvedValue({
        data: {
          list: [
            {
              dt_txt: '2025-12-18 00:00:00',
              main: { temp: 1.0, humidity: 70 },
              weather: [{ description: 'clear sky', icon: '01d' }],
              pop: 0,
            },
            {
              dt_txt: '2025-12-19 00:00:00',
              main: { temp: 2.0, humidity: 70 },
              weather: [{ description: 'clear sky', icon: '01d' }],
              pop: 0,
            },
          ],
        },
      }),
    }));

    jest.doMock('../src/utils/redisClient', () => ({
      redisClient: { get: jest.fn().mockResolvedValue(null), set: jest.fn() },
    }));

    jest.doMock('../src/models', () => ({
      WeatherCache: {
        findByPk: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    }));

    const service = require('../src/services/weather.service');

    const result = await service.getForecastByCity(
      'Kyiv',
      '2025-12-19',
      '2025-12-19',
    );

    expect(result).toEqual(
      expect.objectContaining({
        city: 'Kyiv',
        city_en: 'Kyiv',
        forecast: [expect.objectContaining({ date: '2025-12-19' })],
      }),
    );
  });
});
