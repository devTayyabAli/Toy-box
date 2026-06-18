// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/vehicles/overview:
 *   get:
 *     tags: [Vehicles]
 *     summary: My Garage overview screen
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryRequired'
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, priority, mine], default: mine }
 *       - in: query
 *         name: selectedVehicleId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/service-options:
 *   get:
 *     tags: [Vehicles]
 *     summary: Service request categories for Request screen
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/requests/categories:
 *   get:
 *     tags: [Vehicles]
 *     summary: Request counts grouped by category
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/requests:
 *   get:
 *     tags: [Vehicles]
 *     summary: List garage/service requests
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: vehicleId
 *         schema: { type: integer }
 *       - in: query
 *         name: tab
 *         schema: { type: string, enum: [active, past] }
 *       - in: query
 *         name: unified
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Vehicles]
 *     summary: Create a garage service request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GarageRequestCreate'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/vehicles/requests/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get single request by id
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *
 * /api/v1/vehicles/{id}/actions:
 *   get:
 *     tags: [Vehicles]
 *     summary: Recent actions for vehicle detail
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/health-report:
 *   get:
 *     tags: [Vehicles]
 *     summary: Downloadable health report JSON
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/health:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Update vehicle health items
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleHealthPatch'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/specs:
 *   get:
 *     tags: [Vehicles]
 *     summary: Vehicle specifications sheet
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/documents:
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicle documents by section
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/requests:
 *   get:
 *     tags: [Vehicles]
 *     summary: Requests for one vehicle
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *       - in: query
 *         name: tab
 *         schema: { type: string, enum: [active, past] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/priority:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Toggle priority flag on vehicle
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehiclePriorityPatch'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}:
 *   delete:
 *     tags: [Vehicles]
 *     summary: Delete vehicle (wizard draft or garage)
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         $ref: '#/components/responses/Error404'
 */
