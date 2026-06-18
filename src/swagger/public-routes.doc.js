// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * Routes that do not require Bearer token (override global security).
 *
 * @openapi-disabled
 * /api/v1/health:
 *   get:
 *     security: []
 *     tags: [Health]
 *
 * /api/v1/auth/status:
 *   get:
 *     security: []
 *
 * /api/v1/auth/sign-in:
 *   post:
 *     security: []
 *
 * /api/v1/auth/forgot-password:
 *   post:
 *     security: []
 *
 * /api/v1/auth/reset-password:
 *   post:
 *     security: []
 *
 * /api/v1/auth/refresh:
 *   post:
 *     security: []
 *
 * /api/v1/auth/2fa/verify-login:
 *   post:
 *     security: []
 *
 * /api/v1/stripe/config:
 *   get:
 *     security: []
 *
 * /api/v1/stripe/webhook:
 *   post:
 *     security: []
 */
