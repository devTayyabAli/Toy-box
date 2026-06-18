const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const dashboardController = require("./dashboard.controller");
const { summaryQuerySchema } = require("./dashboard.validation");

/** @swagger tags: [Dashboard] */
router.get("/", validate(summaryQuerySchema, "query"), dashboardController.getSummary);

module.exports = router;
