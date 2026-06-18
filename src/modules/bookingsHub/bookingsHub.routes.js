const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const bookingsHubController = require("./bookingsHub.controller");
const { listQuerySchema } = require("./bookingsHub.validation");

/** @swagger tags: [Bookings] */
router.get("/me", validate(listQuerySchema, "query"), bookingsHubController.listMine);

module.exports = router;
