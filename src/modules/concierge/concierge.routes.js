const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const conciergeController = require("./concierge.controller");
const { conciergeBodySchema } = require("./concierge.validation");

/**
 * @swagger
 * /api/v1/concierge:
 *   get:
 *     summary: List concierge (mock)
 *     description: Returns mock concierge data until a real persistence layer is wired.
 *     tags: [Concierge]
 *     responses:
 *       200:
 *         description: Mock list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessConciergeList'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", conciergeController.getAll);

/**
 * @swagger
 * /api/v1/concierge:
 *   post:
 *     summary: Create concierge entry (mock)
 *     description: Echoes payload in a mock response; not persisted.
 *     tags: [Concierge]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Mock created response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessConciergeCreate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validate(conciergeBodySchema), conciergeController.create);

module.exports = router;
