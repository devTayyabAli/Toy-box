// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**

 * @openapi-disabled

 * /api/v1/dashboard:

 *   get:

 *     tags: [Dashboard]

 *     summary: Home dashboard summary

 *     parameters:

 *       - $ref: '#/components/parameters/memberIdQueryRequired'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/bookings/me:

 *   get:

 *     tags: [Bookings]

 *     summary: Unified bookings history

 *     parameters:

 *       - $ref: '#/components/parameters/memberIdQueryRequired'

 *       - in: query

 *         name: tab

 *         schema:

 *           type: string

 *           enum: [all, active, completed, cancelled]

 *           default: all

 *       - in: query

 *         name: limit

 *         schema: { type: integer, default: 50 }

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/messages:

 *   get:

 *     tags: [Messages]

 *     summary: Concierge message threads

 *     parameters:

 *       - $ref: '#/components/parameters/memberIdQueryRequired'

 *       - in: query

 *         name: limit

 *         schema: { type: integer, default: 100 }

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/messages/send:

 *   post:

 *     tags: [Messages]

 *     summary: Send message to concierge

 *     requestBody:

 *       required: true

 *       content:

 *         application/json:

 *           schema:

 *             $ref: '#/components/schemas/MessageSendBody'

 *     responses:

 *       201:

 *         $ref: '#/components/responses/Success201'

 *

 * /api/v1/messages/{memberId}/read:

 *   patch:

 *     tags: [Messages]

 *     summary: Mark thread as read

 *     parameters:

 *       - $ref: '#/components/parameters/messagesMemberIdPath'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/payment-methods:

 *   get:

 *     tags: [PaymentMethods]

 *     summary: List saved payment methods

 *     parameters:

 *       - $ref: '#/components/parameters/memberIdQueryRequired'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *   post:

 *     tags: [PaymentMethods]

 *     summary: Add payment method manually

 *     requestBody:

 *       required: true

 *       content:

 *         application/json:

 *           schema:

 *             $ref: '#/components/schemas/PaymentMethodCreate'

 *     responses:

 *       201:

 *         $ref: '#/components/responses/Success201'

 *

 * /api/v1/payment-methods/setup-checkout:

 *   post:

 *     tags: [PaymentMethods]

 *     summary: Stripe setup checkout to save card

 *     requestBody:

 *       required: true

 *       content:

 *         application/json:

 *           schema:

 *             type: object

 *             required: [memberId]

 *             properties:

 *               memberId: { type: integer, example: 1 }

 *               successUrl: { type: string, format: uri }

 *               cancelUrl: { type: string, format: uri }

 *     responses:

 *       201:

 *         $ref: '#/components/responses/Success201'

 *

 * /api/v1/payment-methods/{id}/default:

 *   patch:

 *     tags: [PaymentMethods]

 *     summary: Set default payment method

 *     parameters:

 *       - $ref: '#/components/parameters/paymentMethodIdPath'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/payment-methods/{id}:

 *   delete:

 *     tags: [PaymentMethods]

 *     summary: Remove payment method

 *     parameters:

 *       - $ref: '#/components/parameters/paymentMethodIdPath'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/notifications/inbox:

 *   get:

 *     tags: [Notifications]

 *     summary: Notification inbox

 *     security: [{ bearerAuth: [] }]

 *     parameters:

 *       - in: query

 *         name: unreadOnly

 *         schema: { type: boolean }

 *       - in: query

 *         name: limit

 *         schema: { type: integer, default: 50 }

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/notifications/inbox/read-all:

 *   post:

 *     tags: [Notifications]

 *     summary: Mark all notifications read

 *     security: [{ bearerAuth: [] }]

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *   patch:

 *     tags: [Notifications]

 *     summary: Mark all notifications read (PATCH)

 *     security: [{ bearerAuth: [] }]

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/notifications/inbox/{id}/read:

 *   post:

 *     tags: [Notifications]

 *     summary: Mark one notification read

 *     security: [{ bearerAuth: [] }]

 *     parameters:

 *       - $ref: '#/components/parameters/inboxIdPath'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *   patch:

 *     tags: [Notifications]

 *     summary: Mark one notification read (PATCH)

 *     security: [{ bearerAuth: [] }]

 *     parameters:

 *       - $ref: '#/components/parameters/inboxIdPath'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *

 * /api/v1/notifications/settings:

 *   get:

 *     tags: [Notifications]

 *     summary: Notification preferences

 *     security: [{ bearerAuth: [] }]

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 *   patch:

 *     tags: [Notifications]

 *     summary: Update notification preferences

 *     security: [{ bearerAuth: [] }]

 *     requestBody:

 *       required: true

 *       content:

 *         application/json:

 *           schema:

 *             $ref: '#/components/schemas/NotificationSettingsPatch'

 *     responses:

 *       200:

 *         $ref: '#/components/responses/Success200'

 */


