"use strict";

const { VERSIONED_PREFIX } = require("../config/apiVersion");

/**
 * Build a versioned API path, e.g. apiPath("/auth/sign-in") → "/api/v1/auth/sign-in"
 */
function apiPath(segment = "") {
  const normalized = segment.startsWith("/") ? segment : `/${segment}`;
  return `${VERSIONED_PREFIX}${normalized}`;
}

module.exports = { apiPath, VERSIONED_PREFIX };
