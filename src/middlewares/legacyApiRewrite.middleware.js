"use strict";

const { VERSIONED_PREFIX } = require("../config/apiVersion");

function shouldRewrite(path) {
  if (!path.startsWith("/api/")) return false;
  if (path.startsWith(`${VERSIONED_PREFIX}/`) || path === VERSIONED_PREFIX) return false;
  return true;
}

/**
 * Rewrites unversioned `/api/*` to `/api/v1/*` so all handlers are registered once under v1.
 */
function legacyApiRewrite(req, res, next) {
  if (!shouldRewrite(req.path)) {
    return next();
  }

  req.legacyApiPath = req.path;
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  req.url = `${VERSIONED_PREFIX}${req.path.slice(4)}${query}`;

  res.setHeader("Deprecation", "true");
  res.setHeader(
    "Link",
    `<${VERSIONED_PREFIX}${req.legacyApiPath.slice(4)}>; rel="successor-version"`,
  );

  return next();
}

module.exports = legacyApiRewrite;
