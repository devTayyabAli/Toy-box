const path = require("path");

/** Resolve upload directory under project root */
function uploadsRoot() {
  return path.join(process.cwd(), "uploads");
}

module.exports = { uploadsRoot };
