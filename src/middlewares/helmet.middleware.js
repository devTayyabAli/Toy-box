"use strict";

const helmet = require("helmet");

const isDev = process.env.NODE_ENV !== "production";

const docsHelmet = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
});

const apiHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  frameguard: { action: "deny" },
  hsts:
    process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

function helmetMiddleware(req, res, next) {
  if (req.path.startsWith("/api-docs")) {
    return docsHelmet(req, res, next);
  }
  // Dev/Swagger: skip CSP and security headers on JSON API (cleaner responses)
  if (isDev && process.env.HELMET_API !== "true") {
    return next();
  }
  return apiHelmet(req, res, next);
}

module.exports = helmetMiddleware;
