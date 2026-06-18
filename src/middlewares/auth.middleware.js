const jwt = require("jsonwebtoken");
const Response = require("../helpers/response.helper");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return Response.unauthorized(res, "Unauthorized access");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.sub ?? decoded.id;
    req.user = { ...decoded, id };
    return next();
  } catch (err) {
    return Response.unauthorized(res, "Invalid or expired token");
  }
};

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.sub ?? decoded.id;
    req.user = { ...decoded, id };
  } catch {
    /* ignore invalid token — treat as anonymous */
  }
  return next();
};

module.exports = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
