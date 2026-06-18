"use strict";

const Response = require("../helpers/response.helper");

function requireRole(...allowedRoles) {
  const normalized = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const role = String(req.user?.role || "").toLowerCase();
    if (!role || !normalized.includes(role)) {
      const label = allowedRoles.length === 1 ? allowedRoles[0] : allowedRoles.join(" or ");
      const hint = role
        ? `Your token role is "${role}". Sign in as ${label} via POST /api/v1/auth/sign-in, then retry.`
        : "No role on token. Sign in via POST /api/v1/auth/sign-in and ensure Authorize has your accessToken.";
      return Response.unauthorized(res, `Admin access required. ${hint}`, 403);
    }
    return next();
  };
}

module.exports = requireRole;
