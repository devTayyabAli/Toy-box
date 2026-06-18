"use strict";

const db = require("../models");

async function healthCheck(req, res) {
  try {
    await db.sequelize.authenticate();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      requestId: req.id || null,
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
    });
  } catch (err) {
    res.status(503).json({
      status: "UNHEALTHY",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
      requestId: req.id || null,
    });
  }
}

module.exports = { healthCheck };
