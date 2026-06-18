// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/sourcing/overview:
 *   get:
 *     tags: [Sourcing]
 *     summary: Sourcing hub overview copy + stats
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/sourcing/review:
 *   post:
 *     tags: [Sourcing]
 *     summary: Review sourcing request before submit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SourcingRequestBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/sourcing/requests:
 *   post:
 *     tags: [Sourcing]
 *     summary: Submit vehicle sourcing request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SourcingRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   get:
 *     tags: [Sourcing]
 *     summary: List sourcing requests
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
 *
 * /api/v1/sourcing/requests/{id}:
 *   get:
 *     tags: [Sourcing]
 *     summary: Sourcing request detail
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/sourcing/requests/{id}/status:
 *   get:
 *     tags: [Sourcing]
 *     summary: Status timeline
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/sourcing/requests/{id}/cancel:
 *   patch:
 *     tags: [Sourcing]
 *     summary: Cancel sourcing request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/sourcing/requests/{id}/simulate-progress:
 *   post:
 *     tags: [Sourcing]
 *     summary: Dev/demo — advance status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/service-types:
 *   get:
 *     tags: [Transport]
 *     summary: Transport service type options (Figma sub-categories)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/review:
 *   post:
 *     tags: [Transport]
 *     summary: Review transport request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransportRequestBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/requests:
 *   post:
 *     tags: [Transport]
 *     summary: Create transport request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransportRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   get:
 *     tags: [Transport]
 *     summary: List all member requests (unified)
 *     description: |
 *       Returns transport, detailing/wash, maintenance, sourcing, and garage requests in one feed.
 *       Each item includes `referenceNumber` (e.g. `TB - 2026 - 0522 - 167`), `source`, and `requestType`.
 *       Use `unified=false` for transport-only rows. Filter by `referenceNumber` to fetch a single request.
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: referenceNumber
 *         schema: { type: string, example: "TB - 2026 - 0522 - 167" }
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: string
 *           enum:
 *             - transport_delivery
 *             - detailing_wash
 *             - maintenance_service
 *             - vehicle_sourcing
 *             - vehicle_booking
 *             - vehicle_source_assistance
 *       - in: query
 *         name: tab
 *         schema: { type: string, enum: [all, active, past, completed, cancelled] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: unified
 *         schema: { type: boolean, default: true }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/requests/{id}:
 *   get:
 *     tags: [Transport]
 *     summary: Request detail by id (any source)
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [transport, detailing, maintenance, sourcing, garage_request]
 *           default: transport
 *       - in: query
 *         name: referenceNumber
 *         description: Lookup by reference instead of path id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/requests/{id}/status:
 *   get:
 *     tags: [Transport]
 *     summary: Tracking status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/requests/{id}/cancel:
 *   patch:
 *     tags: [Transport]
 *     summary: Cancel transport request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/transport/requests/{id}/simulate-progress:
 *   post:
 *     tags: [Transport]
 *     summary: Dev/demo — advance status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */

