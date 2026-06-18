// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/requests:
 *   get:
 *     tags: [Requests]
 *     summary: List service requests
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Requests]
 *     summary: Create service request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestCreate'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/requests/{id}/status:
 *   patch:
 *     tags: [Requests]
 *     summary: Update request status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestStatusBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/members:
 *   get:
 *     tags: [Members]
 *     summary: List members
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Members]
 *     summary: Create member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberCreate'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/concierge:
 *   get:
 *     tags: [Concierge]
 *     summary: Concierge placeholder list
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Concierge]
 *     summary: Create concierge entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 */
