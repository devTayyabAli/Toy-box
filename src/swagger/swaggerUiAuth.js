"use strict";

/**
 * Browser-side Swagger UI hooks (serialized into /api-docs page).
 * Auto-applies Bearer token after successful sign-in or setup-password.
 */

function swaggerRequestInterceptor(req) {
  req.headers = req.headers || {};
  req.headers["ngrok-skip-browser-warning"] = "69420";

  if (typeof req.url === "string") {
    if (req.url.includes("/api-docs/openapi.json")) {
      req.url = "/api-docs/openapi.json";
    } else if (
      req.url.startsWith("/") &&
      !req.url.startsWith("//") &&
      typeof window !== "undefined" &&
      window.location &&
      /^https?:$/i.test(window.location.protocol)
    ) {
      req.url = `${window.location.origin}${req.url}`;
    }
  }

  return req;
}

function parseResponseBody(response) {
  if (!response) return null;
  if (response.obj && typeof response.obj === "object") return response.obj;
  if (response.body && typeof response.body === "object") return response.body;
  const raw =
    typeof response.text === "string"
      ? response.text
      : typeof response.data === "string"
        ? response.data
        : "";
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function applyBearerToken(token) {
  const clean = String(token || "").replace(/^Bearer\s+/i, "").trim();
  if (!clean || !window.ui || !window.ui.authActions) return false;
  try {
    window.ui.authActions.logout(["bearerAuth"]);
  } catch (_e) {
    /* ignore */
  }
  window.ui.authActions.authorize({
    bearerAuth: {
      name: "bearerAuth",
      schema: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      value: clean,
    },
  });
  const input = document.getElementById("toybox-token-input");
  if (input) input.value = clean;
  const status = document.getElementById("toybox-token-status");
  if (status) {
    status.textContent = "Token applied from sign-in";
    status.className = "";
  }
  return true;
}

function swaggerResponseInterceptor(response) {
  try {
    const url = response.url || "";
    const isAuthLogin =
      /\/api\/v1\/auth\/sign-in(?:\?|$)/.test(url) ||
      /\/api\/v1\/auth\/setup-password(?:\?|$)/.test(url);

    if (isAuthLogin && response.status >= 200 && response.status < 300) {
      const body = parseResponseBody(response);
      const token = body?.data?.accessToken;
      if (token) {
        applyBearerToken(token);
      }
    }
  } catch (_err) {
    /* ignore */
  }
  return response;
}

module.exports = {
  swaggerRequestInterceptor,
  swaggerResponseInterceptor,
  applyBearerToken,
};
