const validate = (schema, property = 'query') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res
        .status(400)
        .json({ error: 'Validation failed', details: errors });
    }

    next();
  };
};

module.exports = validate;
