"use strict";

function buildDialectOptions() {
  const dialectOptions = {};
  if (process.env.DB_SSL === "true") {
    dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    };
  }
  return dialectOptions;
}

function buildPoolConfig() {
  return {
    max: Number(process.env.DB_POOL_MAX) || 20,
    min: Number(process.env.DB_POOL_MIN) || 5,
    idle: Number(process.env.DB_POOL_IDLE_MS) || 30000,
    acquire: Number(process.env.DB_POOL_ACQUIRE_MS) || 30000,
    evict: Number(process.env.DB_POOL_EVICT_MS) || 1000,
  };
}

function buildSequelizeOptions(logging) {
  return {
    dialect: "postgres",
    logging,
    benchmark: true,
    pool: buildPoolConfig(),
    timezone: process.env.DB_TIMEZONE || "+00:00",
    dialectOptions: buildDialectOptions(),
  };
}

module.exports = { buildSequelizeOptions };
