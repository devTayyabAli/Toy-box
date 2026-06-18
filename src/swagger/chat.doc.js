// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/chat/initiate:
 *   post:
 *     tags: [Chat]
 *     summary: Member — start Firebase chat with concierge
 *     description: Creates Firestore conversation if missing and sends welcome message.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initialMessage: { type: string }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 * /api/v1/chat/conversation:
 *   get:
 *     tags: [Chat]
 *     summary: Member — get chat conversation metadata
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/chat/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Member — list chat messages (Firestore)
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Chat]
 *     summary: Member — send chat message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *
 * /api/v1/chat/read:
 *   patch:
 *     tags: [Chat]
 *     summary: Member — mark chat as read
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/admin/chat/initiate:
 *   post:
 *     tags: [Admin — Chat]
 *     summary: Admin — initiate chat with a member
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer }
 *               initialMessage: { type: string }
 *
 * /api/v1/admin/chat/conversations:
 *   get:
 *     tags: [Admin — Chat]
 *     summary: Admin — list all chat conversations
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/admin/chat/{memberId}/messages:
 *   get:
 *     tags: [Admin — Chat]
 *     summary: Admin — get member conversation messages
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Admin — Chat]
 *     summary: Admin — send message to member chat
 *     security:
 *       - bearerAuth: []
 *
 * /api/v1/admin/chat/{memberId}/read:
 *   patch:
 *     tags: [Admin — Chat]
 *     summary: Admin — mark member chat as read
 *     security:
 *       - bearerAuth: []
 */

module.exports = {};
