require("../config/dotenv");
const mongoose = require("mongoose");
const dbConnection = require("../connection/db");
const { seedInitialData } = require("./seedData");
const logger = require("../utils/logger");

dbConnection
  .then(async () => {
    await seedInitialData({ enableOnStartup: true });
    logger.info("Seed command finished successfully.");
  })
  .catch((error) => {
    logger.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
