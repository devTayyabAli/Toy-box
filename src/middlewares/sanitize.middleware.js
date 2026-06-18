"use strict";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function sanitizeString(value) {
  return value.replace(CONTROL_CHARS, "").trim();
}

function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      obj[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      obj[key] = val.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : item && typeof item === "object"
            ? sanitizeObject(item)
            : item,
      );
    } else if (val && typeof val === "object") {
      sanitizeInPlace(val);
    }
  }
}

function sanitizeObject(obj) {
  const out = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      out[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      out[key] = val.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : item && typeof item === "object"
            ? sanitizeObject(item)
            : item,
      );
    } else if (val && typeof val === "object") {
      out[key] = sanitizeObject(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function sanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === "object") {
    try {
      sanitizeInPlace(req.body);
    } catch {
      req.body = sanitizeObject(req.body);
    }
  }

  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);
  }

  next();
}

module.exports = sanitizeMiddleware;
