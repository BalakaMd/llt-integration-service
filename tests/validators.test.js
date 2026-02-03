const {
  searchSchema,
  geocodeSchema,
  searchPoisSchema,
  cityInfoSchema,
} = require('../src/validators/mapsValidators');
const {
  forecastSchema,
  forecastByCitySchema,
} = require('../src/validators/weatherValidators');
const {
  userIdQuerySchema,
  callbackSchema,
  createEventSchema,
} = require('../src/validators/calendarValidators');

describe('validators', () => {
  describe('mapsValidators', () => {
    test('searchSchema: valid', () => {
      const { error } = searchSchema.validate({ q: 'Kyiv' });
      expect(error).toBeUndefined();
    });

    test('searchSchema: invalid without q', () => {
      const { error } = searchSchema.validate({});
      expect(error).toBeTruthy();
    });

    test('geocodeSchema: valid', () => {
      const { error } = geocodeSchema.validate({ address: 'Kyiv, Ukraine' });
      expect(error).toBeUndefined();
    });

    test('searchPoisSchema: invalid when interests empty', () => {
      const { error } = searchPoisSchema.validate({ city: 'Kyiv', interests: [] });
      expect(error).toBeTruthy();
    });

    test('cityInfoSchema: invalid when city empty', () => {
      const { error } = cityInfoSchema.validate({ city: '' });
      expect(error).toBeTruthy();
    });
  });

  describe('weatherValidators', () => {
    test('forecastSchema: valid', () => {
      const { error } = forecastSchema.validate({ lat: 50.45, lng: 30.52 });
      expect(error).toBeUndefined();
    });

    test('forecastSchema: invalid lat out of range', () => {
      const { error } = forecastSchema.validate({ lat: 200, lng: 30.52 });
      expect(error).toBeTruthy();
    });

    test('forecastByCitySchema: valid with optional dates', () => {
      const { error } = forecastByCitySchema.validate({
        city: 'Kyiv',
        start_date: '2025-12-18',
        end_date: '2025-12-22',
      });
      expect(error).toBeUndefined();
    });

    test('forecastByCitySchema: invalid date format', () => {
      const { error } = forecastByCitySchema.validate({
        city: 'Kyiv',
        start_date: '18-12-2025',
      });
      expect(error).toBeTruthy();
    });
  });

  describe('calendarValidators', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    test('userIdQuerySchema: valid uuid', () => {
      const { error } = userIdQuerySchema.validate({ userId });
      expect(error).toBeUndefined();
    });

    test('callbackSchema: invalid without code', () => {
      const { error } = callbackSchema.validate({ state: userId });
      expect(error).toBeTruthy();
    });

    test('createEventSchema: valid payload', () => {
      const { error } = createEventSchema.validate({
        userId,
        title: 'Trip to Paris',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        description: '',
      });
      expect(error).toBeUndefined();
    });

    test('createEventSchema: invalid bad date', () => {
      const { error } = createEventSchema.validate({
        userId,
        title: 'Trip',
        startDate: '2024/01/15',
        endDate: '2024-01-20',
      });
      expect(error).toBeTruthy();
    });
  });
});
