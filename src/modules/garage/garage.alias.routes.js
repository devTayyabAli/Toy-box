const express = require("express");
const garageRoutes = require("./garage.routes");

/**
 * @deprecated Use /api/v1/vehicles instead. Same garage handlers under legacy paths.
 */
const router = express.Router();

router.use((req, res, next) => {
  res.setHeader("Deprecation", 'true; rel="successor"=/api/v1/vehicles');
  res.setHeader("X-API-Notice", "Use /api/v1/vehicles instead of /api/v1/garage");
  next();
});

router.use(garageRoutes);

module.exports = router;
