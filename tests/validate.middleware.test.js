const validate = require('../src/middlewares/validate');
const { forecastSchema } = require('../src/validators/weatherValidators');

describe('validate middleware', () => {
  const createRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  test('calls next() when data is valid', () => {
    const req = { query: { lat: 50.45, lng: 30.52 } };
    const res = createRes();
    const next = jest.fn();

    validate(forecastSchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 400 and details when data is invalid', () => {
    const req = { query: { lat: 999, lng: 30.52 } };
    const res = createRes();
    const next = jest.fn();

    validate(forecastSchema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Array),
      }),
    );
  });
});
