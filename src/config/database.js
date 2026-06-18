require("./env");
const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "config.json");
if (!fs.existsSync(configPath)) {
  throw new Error(`Missing Sequelize config at ${configPath}`);
}
const raw = require(configPath);

function withEnvOverrides(envKey) {
  const c = raw[envKey] ? { ...raw[envKey] } : undefined;
  if (!c || c.use_env_variable) return c;
  c.username = process.env.DB_USERNAME || c.username;
  c.password = process.env.DB_PASSWORD || c.password;
  c.database = process.env.DB_NAME || c.database;
  c.host = process.env.DB_HOST || c.host;
  if (process.env.DB_PORT) c.port = Number(process.env.DB_PORT);
  return c;
}

module.exports = {
  development: withEnvOverrides("development"),
  test: withEnvOverrides("test"),
  production: raw.production,
};
