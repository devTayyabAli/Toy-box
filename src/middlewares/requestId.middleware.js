"use strict";

const crypto = require("crypto");
const logger = require("../utils/logger");

function requestIdMiddleware(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.id =
    (typeof incoming === "string" && incoming.trim()) ||
    `req-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  res.setHeader("X-Request-ID", req.id);

  if (process.env.HTTP_LOG_REQUESTS !== "false") {
    logger.info({
      type: "REQUEST_START",
      requestId: req.id,
      method: req.method,
      path: req.originalUrl || req.path,
      ip: req.ip,
    });
  }

  next();
}

module.exports = requestIdMiddleware;
