const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validatePayload = require("../middlewares/validatePayload.middleware");
const {
  createVehicleSchema,
  updateVehicleSchema,
} = require("../validators/vehicle.validator");
const VehicleController = require("../controllers/vehicle.controller");

router.use(authenticate);

router.post(
  "/vehicles",
  validatePayload(createVehicleSchema),
  VehicleController.create.bind(VehicleController),
);

router.get("/vehicles", VehicleController.list.bind(VehicleController));
router.get("/vehicles/:id", VehicleController.getById.bind(VehicleController));

router.put(
  "/vehicles/:id",
  validatePayload(updateVehicleSchema),
  VehicleController.update.bind(VehicleController),
);

router.delete("/vehicles/:id", VehicleController.remove.bind(VehicleController));

module.exports = router;
