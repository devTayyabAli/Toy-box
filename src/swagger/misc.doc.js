// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/clinics:
 *   get:
 *     tags: [Concierge]
 *     summary: List clinics (legacy module)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/pt:
 *   get:
 *     tags: [Concierge]
 *     summary: List PT entries (legacy module)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/role-requests:
 *   get:
 *     tags: [Members]
 *     summary: List role requests
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/support/overview:
 *   get:
 *     tags: [Support]
 *     summary: Help center overview
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/support/search:
 *   get:
 *     tags: [Support]
 *     summary: Search help articles
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, example: vehicle }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/members/{memberId}/diary:
 *   get:
 *     tags: [Members]
 *     summary: Member diary entries
 *     parameters:
 *       - name: memberId
 *         in: path
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
