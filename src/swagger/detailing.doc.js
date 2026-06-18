// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/detailing/catalog:
 *   get:
 *     tags: [Detailing]
 *     summary: Full detailing catalog
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/packages:
 *   get:
 *     tags: [Detailing]
 *     summary: Detailing packages list
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/add-ons:
 *   get:
 *     tags: [Detailing]
 *     summary: Optional add-ons
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/locations:
 *   get:
 *     tags: [Detailing]
 *     summary: Service locations (workshop / storage)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/estimate:
 *   post:
 *     tags: [Detailing]
 *     summary: Price estimate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetailingBookingBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/review:
 *   post:
 *     tags: [Detailing]
 *     summary: Review summary before booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetailingBookingBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/bookings:
 *   get:
 *     tags: [Detailing]
 *     summary: List detailing bookings
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
 *     tags: [Detailing]
 *     summary: Create detailing booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetailingBookingBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/detailing/bookings/{id}:
 *   get:
 *     tags: [Detailing]
 *     summary: Booking detail
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Detailing]
 *     summary: Update booking
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageKey: { type: string }
 *               addonKeys: { type: array, items: { type: string } }
 *               scheduledDate: { type: string, format: date }
 *               specialInstructions: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/bookings/{id}/progress:
 *   get:
 *     tags: [Detailing]
 *     summary: Live progress tracker
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/bookings/{id}/job-detail:
 *   get:
 *     tags: [Detailing]
 *     summary: Job detail with photos
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/bookings/{id}/cancel:
 *   patch:
 *     tags: [Detailing]
 *     summary: Cancel booking
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/detailing/bookings/{id}/simulate-progress:
 *   post:
 *     tags: [Detailing]
 *     summary: Dev/demo — advance booking status
 *     parameters:
 *       - $ref: '#/components/parameters/bookingIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */

