const express = require("express");
const router = express.Router();
const ptController = require("./pt.controller");

router.get("/", ptController.getAll);

module.exports = router;
