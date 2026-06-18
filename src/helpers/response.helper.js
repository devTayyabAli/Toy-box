class ResponseHelper {
  static success(res, message = "Success", data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = "Something went wrong", statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: process.env.NODE_ENV === "development" ? error : null,
      timestamp: new Date().toISOString(),
    });
  }

  static validationError(res, message = "Validation failed", errors = [], statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static unauthorized(res, message = "Unauthorized access", statusCode = 401) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(res, message = "Resource not found", statusCode = 404) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ResponseHelper;
