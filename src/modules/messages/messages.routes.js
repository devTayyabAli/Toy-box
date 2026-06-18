const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const c = require("./messages.controller");
const v = require("./messages.validation");

router.get("/", validate(v.listQuerySchema, "query"), c.list);
router.post("/send", validate(v.sendSchema), c.send);
router.patch(
  "/:memberId/read",
  validate(v.memberIdParamSchema, "params"),
  c.markRead,
);

module.exports = router;
