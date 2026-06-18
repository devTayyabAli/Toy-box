"use strict";

const logger = require("../utils/logger");

const SLOW_QUERY_MS = Number(process.env.SEQUELIZE_SLOW_QUERY_MS) || 1000;

function resolveSequelizeLogging() {
  if (process.env.DISABLE_LOGS === "true") return false;

  const isProduction = process.env.NODE_ENV === "production";
  const logAllQueries =
    process.env.SEQUELIZE_LOG_QUERIES === "true" ||
    (!isProduction && process.env.SEQUELIZE_LOG_QUERIES !== "false");

  return (sql, timingMs) => {
    const duration =
      typeof timingMs === "number" && Number.isFinite(timingMs) ? timingMs : null;

    if (duration !== null && duration >= SLOW_QUERY_MS) {
      logger.warning("SLOW_QUERY", {
        query: sql,
        durationMs: duration,
        thresholdMs: SLOW_QUERY_MS,
        timestamp: new Date().toISOString(),
      });
    }

    if (!logAllQueries && (isProduction || duration === null)) return;

    if (isProduction) {
      logger.debug(
        duration !== null ? `[sequelize] ${sql} (${duration}ms)` : `[sequelize] ${sql}`,
      );
      return;
    }

    const suffix = duration !== null ? ` (${duration}ms)` : "";
    console.log(`[sequelize] ${sql}${suffix}`);
  };
}

module.exports = { resolveSequelizeLogging, SLOW_QUERY_MS };
