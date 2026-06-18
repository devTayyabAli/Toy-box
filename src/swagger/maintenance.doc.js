// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/maintenance/catalog:
 *   get:
 *     tags: [Maintenance]
 *     summary: Maintenance catalog (services + locations metadata)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/service-types:
 *   get:
 *     tags: [Maintenance]
 *     summary: List selectable service types
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/locations:
 *   get:
 *     tags: [Maintenance]
 *     summary: Workshop / pickup locations
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/estimate:
 *   post:
 *     tags: [Maintenance]
 *     summary: Price estimate before booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceRequestBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/review:
 *   post:
 *     tags: [Maintenance]
 *     summary: Review screen summary before submit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceRequestBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests:
 *   get:
 *     tags: [Maintenance]
 *     summary: List maintenance requests
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Maintenance]
 *     summary: Create maintenance request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/maintenance/requests/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance request detail
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Maintenance]
 *     summary: Update maintenance request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceKeys: { type: array, items: { type: string } }
 *               scheduledAt: { type: string, format: date-time }
 *               locationKey: { type: string }
 *               notes: { type: string }
 *               documentUrls: { type: array, items: { type: string, format: uri } }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests/{id}/status:
 *   get:
 *     tags: [Maintenance]
 *     summary: Tracking status timeline
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests/{id}/approval:
 *   get:
 *     tags: [Maintenance]
 *     summary: Approval / payment summary for request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests/{id}/approve-payment:
 *   post:
 *     tags: [Maintenance]
 *     summary: Approve quote — returns Stripe checkoutUrl when configured
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests/{id}/cancel:
 *   patch:
 *     tags: [Maintenance]
 *     summary: Cancel maintenance request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/requests/{id}/simulate-progress:
 *   post:
 *     tags: [Maintenance]
 *     summary: Dev/demo — advance request status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/jobs:
 *   get:
 *     tags: [Maintenance]
 *     summary: List workshop jobs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/jobs/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get job detail
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/jobs/{id}/status:
 *   patch:
 *     tags: [Maintenance]
 *     summary: Update job status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Service in progress, Ready for delivery, Completed]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/maintenance/jobs/{id}/checklist:
 *   patch:
 *     tags: [Maintenance]
 *     summary: Update job checklist items
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [key, done]
 *                   properties:
 *                     key: { type: string }
 *                     done: { type: boolean }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
