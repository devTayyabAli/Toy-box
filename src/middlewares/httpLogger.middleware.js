"use strict";

const logger = require("../utils/logger");

function httpLoggerMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warning" : "info";

    logger[level]({
      type: "HTTP_REQUEST",
      requestId: req.id,
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
    });
  });

  next();
}

module.exports = httpLoggerMiddleware;
