const { nullToEmpty } = require("../helpers/nullToEmpty.helper");

/**
 * Frontend convention: optional empty fields are "" instead of null.
 */
function nullToEmptyResponse(req, res, next) {
  const shouldTransform =
    req.path.startsWith("/api/v1/") || req.path === "/api/v1/health";

  if (!shouldTransform) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function jsonWithEmptyStrings(body) {
    return originalJson(nullToEmpty(body));
  };

  next();
}

module.exports = nullToEmptyResponse;
