jest.mock('../src/utils/redisClient', () => {
  return {
    redisClient: {
      get: jest.fn(),
      set: jest.fn(),
    },
  };
});

jest.mock('../src/utils/googleMapsClient', () => {
  return {
    textSearch: jest.fn(),
    geocode: jest.fn(),
  };
});

const googleMapsClient = require('../src/utils/googleMapsClient');
const { redisClient } = require('../src/utils/redisClient');
const mapsService = require('../src/services/maps.service');

describe('maps.service', () => {
  beforeEach(() => {
    redisClient.get.mockReset();
    redisClient.set.mockReset();
    googleMapsClient.textSearch.mockReset();
    googleMapsClient.geocode.mockReset();
  });

  test('searchPlaces: returns cached results when present in Redis', async () => {
    const cached = [{ external_ref: 'p1' }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const result = await mapsService.searchPlaces('coffee in Kyiv');

    expect(result).toEqual(cached);
    expect(googleMapsClient.textSearch).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  test('searchPlaces: calls Google and caches normalized places when cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    googleMapsClient.textSearch.mockResolvedValue({
      data: {
        results: [
          {
            place_id: 'abc',
            name: 'Test Place',
            formatted_address: 'Somewhere',
            geometry: { location: { lat: 1.23, lng: 4.56 } },
            rating: 4.5,
            types: ['cafe'],
            photos: [{ photo_reference: 'photo1' }],
          },
        ],
      },
    });

    const result = await mapsService.searchPlaces('coffee');

    expect(result).toEqual([
      {
        external_ref: 'abc',
        name: 'Test Place',
        lat: 1.23,
        lng: 4.56,
        address: 'Somewhere',
        rating: 4.5,
        categories: ['cafe'],
        photo_ref: 'photo1',
      },
    ]);
    expect(redisClient.set).toHaveBeenCalledTimes(1);
  });

  test('geocode: returns null when Google has no results', async () => {
    redisClient.get.mockResolvedValue(null);
    googleMapsClient.geocode.mockResolvedValue({ data: { results: [] } });

    const result = await mapsService.geocode('unknown place');

    expect(result).toBeNull();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  test('getCityInfo: parses country from formatted address', async () => {
    redisClient.get.mockResolvedValue(null);
    googleMapsClient.geocode.mockResolvedValue({
      data: {
        results: [
          {
            formatted_address: 'Kyiv, Kyiv City, Ukraine',
            geometry: { location: { lat: 50.45, lng: 30.52 } },
          },
        ],
      },
    });

    const info = await mapsService.getCityInfo('Київ');

    expect(info).toEqual({
      name: 'Київ',
      name_en: 'Kyiv',
      coordinates: { lat: 50.45, lng: 30.52 },
      country: 'Ukraine',
      formatted_address: 'Kyiv, Kyiv City, Ukraine',
    });
  });
});
