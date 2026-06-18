const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validation.middleware");
const requestsController = require("./requests.controller");
const requestsService = require("./requests.service");
const { createRequestSchema, requestStatusSchema } = require("./requests.validation");

/**
 * @swagger
 * /api/v1/requests:
 *   get:
 *     summary: List all service requests
 *     description: Returns every `Request` linking a member to a vehicle.
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: List of requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessRequests'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", requestsController.getAll);

/**
 * @swagger
 * /api/v1/requests:
 *   post:
 *     summary: Create a service request
 *     description: Creates a `Request` for a `memberId` and `vehicleId`.
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestCreate'
 *     responses:
 *       201:
 *         description: Request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessRequest'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validate(createRequestSchema), requestsController.create);

/**
 * @swagger
 * /api/v1/requests/{id}/status:
 *   patch:
 *     summary: Update request lifecycle status
 *     description: Updates workflow status for a request.
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Request primary key
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestStatusBody'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessRequest'
 *       400:
 *         description: Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/status", validate(requestStatusSchema), async (req, res, next) => {
  try {
    const data = await requestsService.updateLifecycle(req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
