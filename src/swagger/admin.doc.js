// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/admin/vehicles/inventory/wizard/schema:
 *   get:
 *     tags: [Admin — Inventory]
 *     summary: Add vehicle form schema (steps, fields, document keys)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/admin/vehicles/inventory:
 *   post:
 *     tags: [Admin — Inventory]
 *     summary: Add vehicle to admin inventory (4-step wizard)
 *     description: |
 *       **Admin only.** Matches the Add Vehicle UI (Vehicle Info → Ownership → Docs → Health).
 *
 *       **JSON:** send `vehicleInfo`, `ownershipInfo`, `health`, optional `documents` object with URLs.
 *
 *       **Multipart:** one request with flat fields + **6 document file fields** (Step 3):
 *       `vehicleRegistration`, `insuranceCertificate`, `specsAndInfo`, `serviceRecord`,
 *       `purchasedInvoice`, `warrantyCertificate`, plus optional `vehicleImage`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleInfo, ownershipInfo, health]
 *             properties:
 *               vehicleInfo:
 *                 $ref: '#/components/schemas/VehicleInfo'
 *               ownershipInfo:
 *                 $ref: '#/components/schemas/VehicleOwnershipInfo'
 *               health:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/VehicleHealthItem'
 *               documents:
 *                 type: object
 *                 description: Pre-uploaded document URLs (optional if using multipart files)
 *                 properties:
 *                   vehicleRegistration: { type: string, format: uri }
 *                   insuranceCertificate: { type: string, format: uri }
 *                   specsAndInfo: { type: string, format: uri }
 *                   serviceRecord: { type: string, format: uri }
 *                   purchasedInvoice: { type: string, format: uri }
 *                   warrantyCertificate: { type: string, format: uri }
 *               status: { type: string, example: Stored }
 *               isPriority: { type: boolean }
 *               imageUrl: { type: string, format: uri }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - engine
 *               - power
 *               - transmission
 *               - drive
 *               - zeroToHundred
 *               - topSpeed
 *               - colour
 *               - chassisNo
 *               - plate
 *               - purchasedAt
 *               - storageBay
 *               - mileage
 *             properties:
 *               make: { type: string, example: Lamborghini }
 *               model: { type: string, example: Huracan STO }
 *               year: { type: integer, example: 2022 }
 *               engine: { type: string }
 *               power: { type: string }
 *               transmission: { type: string }
 *               drive: { type: string }
 *               zeroToHundred: { type: string }
 *               topSpeed: { type: string }
 *               colour: { type: string }
 *               chassisNo: { type: string }
 *               plate: { type: string }
 *               purchasedAt: { type: string, example: "2022-01-01" }
 *               storageBay: { type: string }
 *               mileage: { type: string }
 *               health_engine_drivetrain: { type: integer, minimum: 0, maximum: 100 }
 *               health_tyres: { type: integer, minimum: 0, maximum: 100 }
 *               health_brakes: { type: integer, minimum: 0, maximum: 100 }
 *               health_fluids: { type: integer, minimum: 0, maximum: 100 }
 *               health_battery: { type: integer, minimum: 0, maximum: 100 }
 *               health_exterior_body: { type: integer, minimum: 0, maximum: 100 }
 *               health_engine_drivetrain_note: { type: string }
 *               health_tyres_note: { type: string }
 *               health_brakes_note: { type: string }
 *               health_fluids_note: { type: string }
 *               health_battery_note: { type: string }
 *               health_exterior_body_note: { type: string }
 *               vehicleRegistration:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Vehicle Registration file
 *               insuranceCertificate:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Insurance Certificate file
 *               specsAndInfo:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Specs and info file
 *               serviceRecord:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Service Record file
 *               purchasedInvoice:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Purchased Invoice file
 *               warrantyCertificate:
 *                 type: string
 *                 format: binary
 *                 description: Step 3 — Warranty Certificate file
 *               vehicleImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional vehicle photo
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   get:
 *     tags: [Admin — Inventory]
 *     summary: List admin inventory vehicles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/admin/vehicles/inventory/{id}:
 *   get:
 *     tags: [Admin — Inventory]
 *     summary: Get inventory vehicle (full detail)
 *     description: Replace `{id}` with the numeric vehicle id from the list response (e.g. `4`), not the literal text `{id}`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Admin — Inventory]
 *     summary: Update inventory vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: [Admin — Inventory]
 *     summary: Delete inventory vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/admin/sourcing/requests:
 *   get:
 *     tags: [Admin — Sourcing]
 *     summary: List all member sourcing requests
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/admin/sourcing/requests/{id}:
 *   get:
 *     tags: [Admin — Sourcing]
 *     summary: Get sourcing request with assignment history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/admin/sourcing/requests/{id}/assignments:
 *   get:
 *     tags: [Admin — Sourcing]
 *     summary: List vehicle assignments for a request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/admin/sourcing/requests/{id}/assign:
 *   post:
 *     tags: [Admin — Sourcing]
 *     summary: Assign inventory vehicle (pending member approval)
 *     description: Use a `vehicleId` from GET /api/v1/admin/vehicles/inventory (inventory vehicles only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Sourcing request id from GET /api/v1/admin/sourcing/requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId]
 *             properties:
 *               vehicleId: { type: integer, example: 4 }
 *               adminNotes: { type: string, example: "Matches member specs" }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/sourcing/my-requests:
 *   post:
 *     tags: [Sourcing]
 *     summary: Member — submit sourcing request
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/sourcing/requests/{id}/pending-vehicle:
 *   get:
 *     tags: [Sourcing]
 *     summary: Member — view admin-assigned vehicle offer
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/sourcing/requests/{id}/approve-vehicle:
 *   post:
 *     tags: [Sourcing]
 *     summary: Member — approve vehicle (adds to garage)
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/sourcing/requests/{id}/reject-vehicle:
 *   post:
 *     tags: [Sourcing]
 *     summary: Member — reject vehicle (not added to garage)
 *     security:
 *       - bearerAuth: []
 */

module.exports = {};
