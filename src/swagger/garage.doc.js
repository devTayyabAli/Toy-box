// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * Deprecated /api/v1/garage/* — use /api/v1/vehicles instead. Add vehicle = POST /api/v1/vehicles multipart only.
 *
 * @openapi-disabled
 * /api/v1/garage/overview:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles/overview
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryRequired'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/garage/vehicles:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/garage/service-options:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles/service-options
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/garage/requests:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles/requests
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) POST /api/v1/vehicles/requests
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GarageRequestCreate'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/garage/vehicles/{id}:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles/{id}
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/garage/vehicles/{id}/actions:
 *   get:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) GET /api/v1/vehicles/{id}/actions
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/garage/vehicles/{id}/health:
 *   patch:
 *     tags: [Garage]
 *     deprecated: true
 *     summary: (deprecated) PATCH /api/v1/vehicles/{id}/health
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleHealthPatch'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
