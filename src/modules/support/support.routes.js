const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const supportController = require("./support.controller");
const { supportSearchQuerySchema } = require("./support.validation");

/**
 * @swagger
 * /api/v1/support/overview:
 *   get:
 *     summary: Help & Support dashboard payload
 *     description: Categories with article counts, FAQs, and quick contact actions (concierge / Ask Steve).
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: Overview
 */
router.get("/overview", supportController.getOverview);

/**
 * @swagger
 * /api/v1/support/search:
 *   get:
 *     summary: Search articles and FAQs
 *     tags: [Support]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search string
 *     responses:
 *       200:
 *         description: Matching articles and FAQs
 */
router.get(
  "/search",
  validate(supportSearchQuerySchema, "query"),
  supportController.search,
);

module.exports = router;
