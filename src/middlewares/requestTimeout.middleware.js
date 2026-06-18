"use strict";

const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 30000;
const RESPONSE_TIMEOUT_MS =
  Number(process.env.RESPONSE_TIMEOUT_MS) || REQUEST_TIMEOUT_MS + 5000;

function requestTimeoutMiddleware(req, res, next) {
  req.setTimeout(REQUEST_TIMEOUT_MS);
  res.setTimeout(RESPONSE_TIMEOUT_MS);
  next();
}

module.exports = requestTimeoutMiddleware;
