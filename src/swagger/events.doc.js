// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/events:
 *   get:
 *     tags: [Events]
 *     summary: List club events
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [all, drives, auctions, dining, track] }
 *       - in: query
 *         name: isFeatured
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: [Events]
 *     summary: Create event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, startsAt]
 *             properties:
 *               title: { type: string }
 *               category: { type: string, enum: [drives, auctions, dining, track] }
 *               description: { type: string }
 *               location: { type: string }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *               isAllDay: { type: boolean }
 *               imageUrl: { type: string }
 *               isFeatured: { type: boolean }
 *               capacity: { type: integer }
 *               accessType: { type: string, enum: [open, invite_only, byo_car] }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Event detail
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Events]
 *     summary: Update event
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               category: { type: string, enum: [drives, auctions, dining, track] }
 *               description: { type: string }
 *               location: { type: string }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *               capacity: { type: integer }
 *               accessType: { type: string, enum: [open, invite_only, byo_car] }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: [Events]
 *     summary: Delete event
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/events/{id}/rsvp:
 *   post:
 *     tags: [Events]
 *     summary: RSVP to event
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer, example: 1 }
 *               isFavorite: { type: boolean }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   patch:
 *     tags: [Events]
 *     summary: Update RSVP (favorite)
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId, isFavorite]
 *             properties:
 *               memberId: { type: integer }
 *               isFavorite: { type: boolean }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: [Events]
 *     summary: Cancel RSVP
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
