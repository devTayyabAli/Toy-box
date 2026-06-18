const express = require("express");
const router = express.Router();
const roleRequestsController = require("./roleRequests.controller");

router.get("/", roleRequestsController.getAll);

module.exports = router;
