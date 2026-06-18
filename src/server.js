require("./config/env");

const { validateEnv } = require("./config/validateEnv");
const logger = require("./utils/logger");

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const firebaseConfig = require("./config/firebase");
const { verifyEmailOnStartup } = require("./services/email.service");
const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require("./app");
const db = require("./models");
const { createSocketServer } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;
const SERVER_TIMEOUT_MS = Number(process.env.SERVER_TIMEOUT_MS) || 60000;
const SHUTDOWN_FORCE_MS = Number(process.env.SHUTDOWN_FORCE_MS) || 30000;

function createHttpServer(expressApp) {
  const keyPath = process.env.TLS_KEY_PATH;
  const certPath = process.env.TLS_CERT_PATH;

  if (keyPath && certPath) {
    return https.createServer(
      {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      expressApp,
    );
  }

  if (process.env.NODE_ENV === "production" && process.env.REQUIRE_TLS === "true") {
    throw new Error(
      "TLS_KEY_PATH and TLS_CERT_PATH are required when REQUIRE_TLS=true in production",
    );
  }

  return http.createServer(expressApp);
}

db.sequelize
  .authenticate()
  .then(() => logger.info("PostgreSQL database connected."))
  .catch((err) => logger.error("Unable to connect to the database:", err.message));

const server = createHttpServer(app);
server.setTimeout(SERVER_TIMEOUT_MS);

const io = createSocketServer(server);
app.set("io", io);

server.listen(PORT, () => {
  const scheme =
    process.env.TLS_KEY_PATH && process.env.TLS_CERT_PATH ? "https" : "http";
  logger.info(`Server listening on ${scheme}://localhost:${PORT}`);
  logger.info(`Swagger docs: ${scheme}://localhost:${PORT}/api-docs`);

  const firebaseClient = require("./config/firebase.client");
  if (firebaseConfig.enabled) {
    logger.info("Firebase Admin + FCM push enabled.");
  } else if (firebaseClient.isConfigured()) {
    logger.info(
      "Firebase client configured. Add secrets/firebase-service-account.json for push.",
    );
  } else {
    logger.info("Firebase not configured — set FIREBASE_* in .env");
  }
  verifyEmailOnStartup();
});

let shuttingDown = false;

async function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — graceful shutdown started`);

  const forceTimer = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_FORCE_MS);
  forceTimer.unref();

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      if (io) {
        io.close();
        logger.info("Socket.io closed");
      }

      await db.sequelize.close();
      logger.info("Database connection closed");

      clearTimeout(forceTimer);
      logger.info("Process terminated");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown:", err.message);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = { server, io };
