"use strict";

const { API_VERSION, LEGACY_PREFIX, VERSIONED_PREFIX } = require("../config/apiVersion");

function versionInfo(req, res) {
  res.json({
    success: true,
    data: {
      version: API_VERSION,
      canonicalPrefix: VERSIONED_PREFIX,
      legacyPrefix: LEGACY_PREFIX,
      note: "Prefer versioned URLs for new integrations.",
    },
    requestId: req.id || null,
  });
}

module.exports = { versionInfo };
