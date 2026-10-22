const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  convert: true,
};

export const validate = (schema) => (req, res, next) => {
  const schemas = schema.validate ? { body: schema } : schema;
  const errors = [];

  for (const [key, sectionSchema] of Object.entries(schemas)) {
    const { error, value } = sectionSchema.validate(
      req[key],
      validationOptions,
    );

    if (error) {
      errors.push(
        ...error.details.map((detail) => detail.message.replace(/["]/g, "")),
      );
      continue;
    }

    if (key === "body") {
      req.body = value;
    } else if (key === "params") {
      Object.assign(req.params, value);
    } else if (key === "query") {
      Object.assign(req.query, value);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: errors.length === 1 ? errors[0] : errors,
    });
  }

  next();
};
