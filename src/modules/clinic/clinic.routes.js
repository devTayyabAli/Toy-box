const express = require("express");
const router = express.Router();
const clinicController = require("./clinic.controller");

router.get("/", clinicController.getAll);

module.exports = router;
