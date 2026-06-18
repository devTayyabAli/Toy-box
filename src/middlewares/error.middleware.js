const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate record already exists";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  }

  if (err.isJoi) {
    statusCode = 400;
    message = err.details?.[0]?.message || "Validation failed";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorMiddleware;
