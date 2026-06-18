"use strict";

/** Current public API version (URL segment). */
const API_VERSION = process.env.API_VERSION || "v1";

/** Legacy unversioned prefix — kept for backward compatibility. */
const LEGACY_PREFIX = "/api";

/** Canonical versioned API prefix, e.g. `/api/v1`. */
const VERSIONED_PREFIX = `${LEGACY_PREFIX}/${API_VERSION}`;

module.exports = {
  API_VERSION,
  LEGACY_PREFIX,
  VERSIONED_PREFIX,
};
