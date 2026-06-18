// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/stripe/config:
 *   get:
 *     tags: [Stripe]
 *     security: []
 *     summary: Stripe publishable key and enabled flag
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/stripe/customer:
 *   post:
 *     tags: [Stripe]
 *     summary: Ensure Stripe customer exists for member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/stripe/checkout:
 *   post:
 *     tags: [Stripe]
 *     summary: Create Stripe Checkout session (payment)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StripeCheckoutBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/stripe/setup-checkout:
 *   post:
 *     tags: [Stripe]
 *     summary: Create Stripe Checkout session (save card)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer, example: 1 }
 *               successUrl: { type: string, format: uri }
 *               cancelUrl: { type: string, format: uri }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/stripe/checkout/{sessionId}:
 *   get:
 *     tags: [Stripe]
 *     summary: Retrieve Checkout session status
 *     parameters:
 *       - $ref: '#/components/parameters/sessionIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
