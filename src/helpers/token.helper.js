const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

function memberId(userOrPayload) {
  if (!userOrPayload) return null;
  return userOrPayload.sub ?? userOrPayload.id ?? userOrPayload._id;
}

function accessMfaFlag(member, options) {
  if (options.mfaVerified === true) return true;
  if (!member.twoFactorEnabled) return true;
  return false;
}

exports.generateAccessToken = (member, options = {}) => {
  const id = memberId(member);
  if (!id) return null;
  const role =
    (member.role && member.role.name) || member.roleName || member.role || "member";
  const mfa = accessMfaFlag(member, options);
  return jwt.sign({ sub: id, id, role, mfa }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

exports.generateRefreshToken = (member, options = {}) => {
  const id = memberId(member);
  if (!id) return null;
  const mfa = accessMfaFlag(member, options);
  return jwt.sign({ sub: id, id, typ: "refresh", mfa }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

exports.verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_SECRET);

exports.generateMfaPendingToken = (memberId) =>
  jwt.sign({ typ: "mfa_pending", sub: memberId }, process.env.JWT_SECRET, { expiresIn: "10m" });

exports.verifyMfaPendingToken = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired MFA token", 401);
  }
  if (decoded.typ !== "mfa_pending") {
    throw new AppError("Invalid MFA token", 401);
  }
  return decoded;
};

exports.generatePasswordSetupToken = (memberId) =>
  jwt.sign({ typ: "password_setup", sub: memberId }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });

exports.verifyPasswordSetupToken = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired setup token. Sign in again with your temporary password.", 401);
  }
  if (decoded.typ !== "password_setup") {
    throw new AppError("Invalid setup token", 401);
  }
  return decoded;
};
