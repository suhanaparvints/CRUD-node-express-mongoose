// export const validate = (schema) => (req, res, next) => {
//    console.log("Schema received:", schema);
//   console.log("Validate method:", typeof schema?.validate);
//   const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

//   if (error) {
//     // Clean and user-friendly messages
//     const errors = error.details.map((detail) => {
//       return detail.message.replace(/["]/g, ""); // remove extra quotes
//     });

//     // If only one error, show as single string; otherwise show list
//     return res.status(400).json({
//       error: errors.length === 1 ? errors[0] : errors,
//     });
//   }

//   next();
// };



// export const validate = (schema) => (req, res, next) => {
//   const errors = [];

//   if (schema.params) {
//     const { error } = schema.params.validate(req.params, {
//       abortEarly: false,
//       allowUnknown: true,
//     });

//     if (error) {
//       errors.push(
//         ...error.details.map((detail) =>
//           detail.message.replace(/["]/g, "")
//         )
//       );
//     }
//   }

//   if (schema.body) {
//     const { error, value } = schema.body.validate(req.body, {
//       abortEarly: false,
//       allowUnknown: true,
//     });

//     if (error) {
//       errors.push(
//         ...error.details.map((detail) =>
//           detail.message.replace(/["]/g, "")
//         )
//       );
//     } else {
//       req.body = value;
//     }
//   }

//   if (errors.length > 0) {
//     return res.status(400).json({
//       status: "ERROR",
//       errors,
//     });
//   }

//   next();
// };



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