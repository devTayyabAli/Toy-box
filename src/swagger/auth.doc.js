// DISABLED for iOS Swagger - only frontend-integration.doc.js is loaded (see src/swagger.js)
/**
 * @openapi-disabled
 * /api/v1/auth/sign-in:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Sign in — copy accessToken for Authorize
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Send password reset OTP (Brevo email)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Reset password with email OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/2fa/send-otp:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Send OTP email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpSendBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/2fa/verify-login:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Verify login OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerifyLoginBody'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *
 * /api/v1/auth/2fa/verify-enable:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Verify OTP and enable 2FA
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerifyEnableBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Change password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Authentication Module]
 *     summary: Current member profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile with stats including activeRequests (in-progress bookings across all services)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         activeRequests:
 *                           type: integer
 *                           description: Total active requests (detailing, maintenance, transport, sourcing, garage)
 *                           example: 2
 *                         activeBookings:
 *                           type: integer
 *                           description: Alias of activeRequests
 *                         vehicleCount: { type: integer }
 *                         bookingCount: { type: integer }
 *                         memberDays: { type: integer }
 *   patch:
 *     tags: [Authentication Module]
 *     summary: Update profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               displayHandle: { type: string }
 *               email: { type: string, format: email }
 *               jobTitle: { type: string }
 *               mobile: { type: string }
 *               mobileCountryCode: { type: string }
 *               residence: { type: string }
 *               coverImageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/billing:
 *   get:
 *     tags: [Authentication Module]
 *     summary: Billing summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/privacy:
 *   get:
 *     tags: [Authentication Module]
 *     summary: Privacy settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Authentication Module]
 *     summary: Update privacy settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivacySettingsPatch'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/sessions:
 *   get:
 *     tags: [Authentication Module]
 *     summary: Active sessions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/membership-tiers:
 *   get:
 *     tags: [Authentication Module]
 *     summary: Membership tiers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/photo:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Upload profile photo
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/auth/profile/cover:
 *   post:
 *     tags: [Authentication Module]
 *     summary: Upload cover image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [coverImage]
 *             properties:
 *               coverImage: { type: string, format: binary }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */

