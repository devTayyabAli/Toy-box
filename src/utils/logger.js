const { Chalk } = require("chalk");
const chalk = new Chalk();

function _logMessages(messages) {
  messages = messages || [];
  messages = ["\nLOG => ", ...messages, "\n"];
  console.log(messages.join(" "));
}

function _logInfo(info) {
  info = info || [];
  info = ["\nINFO => ", ...info, "\n"];
  console.log(chalk.blue(info.join(" ")));
}

function _logWarnings(warnings) {
  warnings = warnings || [];
  warnings = ["\nWARNING => ", ...warnings, "\n"];
  console.log(chalk.yellow(warnings.join(" ")));
}

function _logErrors(errors) {
  errors = errors || [];
  errors = ["\nERROR => ", ...errors, "\n"];
  console.log(chalk.red(errors.join(" ")));
}

function _logDebug(messages) {
  messages = messages || [];
  messages = ["\nDEBUG => ", ...messages, "\n"];
  console.log(chalk.gray(messages.join(" ")));
}

function _logger(type, ...messages) {
  try {
    if (
      !!process.env.DISABLE_LOGS ||
      !messages ||
      !Array.isArray(messages) ||
      !messages.length
    ) {
      return;
    }
    type = type || "log";
    messages.forEach((message, idx) => {
      if (message && typeof message === "object") {
        messages[idx] = JSON.stringify(message);
      }
    });
    switch (type.trim().toLowerCase()) {
      case "log":
        _logMessages(messages);
        break;
      case "info":
        _logInfo(messages);
        break;
      case "warning":
        _logWarnings(messages);
        break;
      case "error":
        _logErrors(messages);
        break;
      case "debug":
        _logDebug(messages);
        break;
      default:
        _logMessages(messages);
        break;
    }
  } catch (error) {
    console.log(error.stack);
  }
}
const logger = {
  log: (...messages) => _logger("log", ...messages),
  info: (...messages) => _logger("info", ...messages),
  warning: (...messages) => _logger("warning", ...messages),
  error: (...messages) => _logger("error", ...messages),
  debug: (...messages) => _logger("debug", ...messages),
};

module.exports = logger;
