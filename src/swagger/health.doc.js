/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     description: Verifies database connectivity, uptime, and memory.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Database unavailable
 */
