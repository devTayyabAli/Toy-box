// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * APIs that enforce Bearer JWT (authenticate middleware).
 * Swagger shows a lock icon; use Authorize with accessToken from sign-in.
 *
 * @openapi-disabled
 * /api/v1/auth/profile:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *   patch:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/billing:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/privacy:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *   patch:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/sessions:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/membership-tiers:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/photo:
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/profile/cover:
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/change-password:
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/auth/2fa/verify-enable:
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/notifications/inbox:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/notifications/inbox/read-all:
 *   patch:
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/notifications/inbox/{id}/read:
 *   patch:
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     security: [{ bearerAuth: [] }]
 *
 * /api/v1/notifications/settings:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *   patch:
 *     security: [{ bearerAuth: [] }]
 */
