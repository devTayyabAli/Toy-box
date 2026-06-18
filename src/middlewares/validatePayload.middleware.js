const Response = require("../helpers/response.helper");

const validatePayload = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const payload = req[source];

      const { error, value } = schema.validate(payload, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return Response.validationError(res, "Validation failed", errors);
      }

      req[source] = value;
      next();
    } catch (err) {
      return Response.error(res, "Payload validation error", 500, err.message);
    }
  };
};

module.exports = validatePayload;
