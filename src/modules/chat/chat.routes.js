"use strict";

const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./chat.controller");
const v = require("./chat.validation");

const router = express.Router();

router.post("/initiate", authenticate, validate(v.initiateSchema), c.initiate);
router.get("/conversation", authenticate, c.getConversation);
router.get("/messages", authenticate, validate(v.listQuerySchema, "query"), c.listMessages);
router.post("/messages", authenticate, validate(v.sendMessageSchema), c.sendMessage);
router.patch("/read", authenticate, c.markRead);

module.exports = router;
