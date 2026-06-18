// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/vehicles/wizard/schema:
 *   get:
 *     tags: [Vehicles]
 *     summary: Add Vehicle — field list per wizard step
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicles (My Garage) or wizard drafts
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, priority, mine], default: mine }
 *       - in: query
 *         name: view
 *         schema: { type: string, enum: [garage, wizard] }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Vehicles]
 *     summary: Add Vehicle — all steps in one multipart request
 *     description: |
 *       Use **multipart/form-data**. Each wizard step has its own fields (not one JSON blob).
 *
 *       **Step 1 — Vehicle info:** make, model, year, engine, power, transmission, drive, zeroToHundred, topSpeed
 *       **Step 2 — Ownership:** colour, chassisNo, plate, purchasedAt, storageBay, mileage
 *       **Step 3 — Docs:** file fields below (optional)
 *       **Step 4 — Health:** health_engine_drivetrain, health_tyres, health_brakes, health_fluids, health_battery, health_exterior_body (0–100) + optional *_note fields
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
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
 *               - health_engine_drivetrain
 *               - health_tyres
 *               - health_brakes
 *               - health_fluids
 *               - health_battery
 *               - health_exterior_body
 *             properties:
 *               memberId:
 *                 oneOf:
 *                   - type: integer
 *                     example: 1
 *                   - type: string
 *                     example: "0000002"
 *                 description: "Step 0 — owner (id or member number 00004, 0000002, …)"
 *               make:
 *                 type: string
 *                 example: Lamborghini
 *                 description: "Step 1 — brand (or use name)"
 *               name:
 *                 type: string
 *                 example: Lamborghini
 *                 description: "Step 1 — alias for make"
 *               model:
 *                 type: string
 *                 example: Huracan STO
 *               year:
 *                 type: integer
 *                 example: 2022
 *               engine:
 *                 type: string
 *                 example: "5.2L Naturally Aspirated V10"
 *               power:
 *                 type: string
 *                 example: "640 hp, 565 Nm"
 *               transmission:
 *                 type: string
 *                 example: "7-speed LDF dual-clutch"
 *               drive:
 *                 type: string
 *                 example: "Rear-wheel drive"
 *               zeroToHundred:
 *                 type: string
 *                 example: "3.0 seconds"
 *               topSpeed:
 *                 type: string
 *                 example: "310 km/h"
 *               vehicleType:
 *                 type: string
 *                 enum: [car, bike, other]
 *                 example: car
 *               colour:
 *                 type: string
 *                 example: Nero Assoluto
 *                 description: "Step 2 — ownership"
 *               chassisNo:
 *                 type: string
 *                 example: ZHWEC2ZF0NLA14901
 *               plate:
 *                 type: string
 *                 example: "Dubai - A 12345"
 *               purchasedAt:
 *                 type: string
 *                 format: date
 *                 example: "2022-01-01"
 *               storageBay:
 *                 type: string
 *                 example: "Bay A-04, Level 1"
 *               mileage:
 *                 type: string
 *                 example: "12,450 km"
 *               health_engine_drivetrain:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85
 *                 description: "Step 4 — health %"
 *               health_engine_drivetrain_note:
 *                 type: string
 *                 example: ""
 *               health_tyres:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 90
 *               health_tyres_note:
 *                 type: string
 *               health_brakes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 88
 *               health_brakes_note:
 *                 type: string
 *               health_fluids:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 82
 *               health_fluids_note:
 *                 type: string
 *               health_battery:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 78
 *               health_battery_note:
 *                 type: string
 *               health_exterior_body:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 91
 *               health_exterior_body_note:
 *                 type: string
 *               vehicleRegistration:
 *                 type: string
 *                 format: binary
 *                 description: "Step 3 — document"
 *               insuranceCertificate:
 *                 type: string
 *                 format: binary
 *               specsAndInfo:
 *                 type: string
 *                 format: binary
 *               serviceRecord:
 *                 type: string
 *                 format: binary
 *               purchasedInvoice:
 *                 type: string
 *                 format: binary
 *               warrantyCertificate:
 *                 type: string
 *                 format: binary
 *               vehicleImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional vehicle photo
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *
 * /api/v1/vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Vehicle detail
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *       - in: query
 *         name: include
 *         schema: { type: string, example: all }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Vehicles]
 *     summary: Update existing vehicle (JSON)
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleAddPartial'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: [Vehicles]
 *     summary: Delete vehicle
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/vehicles/{id}/documents:
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicle documents
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
