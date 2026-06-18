const { Sequelize } = require("sequelize");
require("./env");
const configs = require("./database");
const { resolveSequelizeLogging } = require("./sequelize.logging");
const { buildSequelizeOptions } = require("./sequelize.options");

const logging = resolveSequelizeLogging();
const baseOptions = buildSequelizeOptions(logging);

const env = process.env.NODE_ENV || "development";
const cfg = configs[env];

if (!cfg) {
  throw new Error(`No database configuration for NODE_ENV="${env}"`);
}

let sequelize;
if (cfg.use_env_variable) {
  const url = process.env[cfg.use_env_variable];
  if (!url) {
    throw new Error(`Environment variable ${cfg.use_env_variable} is not set`);
  }
  sequelize = new Sequelize(url, baseOptions);
} else {
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port || 5432,
    ...baseOptions,
  });
}

module.exports = sequelize;
