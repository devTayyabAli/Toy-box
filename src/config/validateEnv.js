"use strict";

const ALWAYS_REQUIRED = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_NAME",
  "DB_USERNAME",
  "NODE_ENV",
  "PORT",
];

const PRODUCTION_REQUIRED = ["DB_PASSWORD", "REFRESH_SECRET"];

const INSECURE_JWT_VALUES = new Set(["change-me", "secret", "jwt_secret"]);

function validateEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  const required = [...ALWAYS_REQUIRED];
  if (isProduction) {
    required.push(...PRODUCTION_REQUIRED);
  }

  const missing = required.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    console.error(message);
    throw new Error(message);
  }

  if (isProduction && INSECURE_JWT_VALUES.has(String(process.env.JWT_SECRET).trim())) {
    throw new Error("JWT_SECRET must be changed for production");
  }

  return true;
}

module.exports = { validateEnv };
