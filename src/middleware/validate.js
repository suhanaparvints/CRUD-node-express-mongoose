const options = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

export const validate = (schema) => (req, res, next) => {
  const details = [];
  const value = {};

  for (const key of ["body", "params", "query"]) {
    if (!schema[key]) {
      continue;
    }

    const result = schema[key].validate(req[key], options);
    if (result.error) {
      details.push(...result.error.details.map((detail) => detail.message));
    } else {
      value[key] = result.value;
    }
  }

  if (details.length > 0) {
    return res.status(400).json({
      status: "ERROR",
      message: "Validation failed",
      details,
    });
  }

  if (value.body) {
    req.body = value.body;
  }
  if (value.params) {
    Object.assign(req.params, value.params);
  }
  if (value.query) {
    Object.assign(req.query, value.query);
  }

  next();
};
