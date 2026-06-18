"use strict";

const rateLimit = require("express-rate-limit");

const rateLimitMessage = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const isDev = process.env.NODE_ENV !== "production";

function shouldSkipAllRateLimits() {
  return process.env.RATE_LIMIT_DISABLED === "true";
}

function shouldSkipAuthRateLimit() {
  if (shouldSkipAllRateLimits()) return true;
  if (process.env.RATE_LIMIT_AUTH_DISABLED === "true") return true;
  // Dev/Swagger: skip auth rate limit unless explicitly enforced
  if (isDev && process.env.RATE_LIMIT_AUTH_ENFORCE !== "true") return true;
  return false;
}

function exposeRateLimitHeaders() {
  if (process.env.RATE_LIMIT_STANDARD_HEADERS === "true") return true;
  if (process.env.RATE_LIMIT_STANDARD_HEADERS === "false") return false;
  return !isDev;
}

function createLimiter({ windowMs, max, message = rateLimitMessage, skip } = {}) {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: exposeRateLimitHeaders(),
    legacyHeaders: false,
    skip,
  });
}

/** Brute-force protection for sign-in / password / 2FA only (not profile, refresh, etc.). */
const credentialAuthLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 30,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in a few minutes.",
  },
  skip: shouldSkipAuthRateLimit,
});

/** @deprecated use credentialAuthLimiter — kept for backwards compatibility */
const authLimiter = credentialAuthLimiter;

const apiLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_API_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_API_MAX) || 1000,
  skip: shouldSkipAllRateLimits,
})
const publicLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 30,
  skip: shouldSkipAllRateLimits,
});

const { VERSIONED_PREFIX } = require("../config/apiVersion");

const STRIPE_WEBHOOK_PATH = `${VERSIONED_PREFIX}/stripe/webhook`;

/** Stripe webhooks must not be rate-limited (provider retries). */
const stripeWebhookSkip = (req, res, next) => {
  if (req.path === STRIPE_WEBHOOK_PATH) return next();
  return apiLimiter(req, res, next);
};

module.exports = {
  authLimiter,
  credentialAuthLimiter,
  apiLimiter,
  publicLimiter,
  stripeWebhookSkip,
};
