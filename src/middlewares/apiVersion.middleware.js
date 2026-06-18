"use strict";

const { API_VERSION } = require("../config/apiVersion");

/** Sets X-API-Version on all API traffic (including legacy rewrites). */
function apiVersionMiddleware(req, res, next) {
  const path = req.path || "";
  if (path.startsWith("/api")) {
    res.setHeader("X-API-Version", API_VERSION);
  }
  next();
}

module.exports = apiVersionMiddleware;
