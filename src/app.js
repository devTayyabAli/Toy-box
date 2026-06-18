require("./config/env");
const path = require("path");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { stripeWebhookSkip } = require("./middlewares/rateLimit.middleware");
const requestIdMiddleware = require("./middlewares/requestId.middleware");
const requestTimeoutMiddleware = require("./middlewares/requestTimeout.middleware");
const httpLoggerMiddleware = require("./middlewares/httpLogger.middleware");
const sanitizeMiddleware = require("./middlewares/sanitize.middleware");
const helmetMiddleware = require("./middlewares/helmet.middleware");
const apiVersionMiddleware = require("./middlewares/apiVersion.middleware");
const legacyApiRewrite = require("./middlewares/legacyApiRewrite.middleware");
const { VERSIONED_PREFIX } = require("./config/apiVersion");
const { swaggerUi, buildSwaggerUiOptions, buildSpecsForRequest } = require("./swagger");
const registerRoutes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const nullToEmptyResponse = require("./middlewares/nullToEmpty.middleware");

const stripeWebhook = require("./modules/stripe/stripe.webhook");
const stripeRaw = express.raw({ type: "application/json" });

const app = express();

app.disable("x-powered-by");
app.set("etag", false);

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(requestIdMiddleware);
app.use(requestTimeoutMiddleware);
app.use(apiVersionMiddleware);
app.use(legacyApiRewrite);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
      "X-Request-ID",
    ],
    exposedHeaders: ["X-API-Version", "X-Request-ID", "Deprecation", "Link"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

app.use(helmetMiddleware);

app.post(`${VERSIONED_PREFIX}/stripe/webhook`, stripeRaw, stripeWebhook);

app.use(express.json());
app.use(sanitizeMiddleware);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(VERSIONED_PREFIX, (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  next();
});

app.use(httpLoggerMiddleware);
app.use(compression());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve);

app.get("/api-docs/openapi.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("ngrok-skip-browser-warning", "69420");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.json(buildSpecsForRequest(req));
});

app.get("/api-docs", (req, res, next) => {
  const spec = buildSpecsForRequest(req);
  swaggerUi.setup(spec, buildSwaggerUiOptions({ inline: true }))(req, res, next);
});

app.get("/api-docs/", (req, res, next) => {
  const spec = buildSpecsForRequest(req);
  swaggerUi.setup(spec, buildSwaggerUiOptions({ inline: true }))(req, res, next);
});

app.use(stripeWebhookSkip);
app.use(nullToEmptyResponse);
registerRoutes(app);

app.use(errorMiddleware);

module.exports = app;
