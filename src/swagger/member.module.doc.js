/**
 * @openapi
 * /api/v1/auth/sign-in:
 *   post:
 *     tags: ["Member — Auth", "Admin — Auth", "Staff — Auth"]
 *     summary: Sign in
 *     description: |
 *       Unified sign-in for **member**, **staff**, and **admin**.
 *       Returns `accessToken`, `refreshToken`, and role-based fields (`role`, `panel`, etc.).
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
 *         description: Returns accessToken and refreshToken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [member, staff, admin] }
 *                     panel: { type: string, enum: [member, staff, admin] }
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *       401:
 *         $ref: '#/components/responses/Error401'
 *
 *
 * /api/v1/auth/invitations/verify-otp:
 *   post:
 *     tags: ["Member — Auth"]
 *     summary: Verify invitation activation OTP
 *     description: |
 *       After admin invite, user receives a 6-digit OTP by email.
 *       Call this before `POST /api/v1/auth/setup-password`.
 *       Returns `setupToken` and role-based profile (`role`, `panel`, `user`).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP valid — use setupToken in setup-password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [member, staff] }
 *                     panel: { type: string, enum: [member, staff] }
 *                     setupToken: { type: string }
 *                     user: { type: object }
 *                     nextStep: { type: string, example: "POST /api/v1/auth/setup-password" }
 *       401:
 *         $ref: '#/components/responses/Error401'
 *
 *
 * /api/v1/auth/setup-password:
 *   post:
 *     tags: ["Member — Auth"]
 *     summary: Set password after invitation OTP verified
 *     description: |
 *       iOS `APIEndpoints.Auth.setupPassword` → `api/v1/auth/setup-password`
 *       **Flow:** invite email OTP → `POST /invitations/verify-otp` → this endpoint → signed in.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [setupToken, newPassword, confirmPassword]
 *             properties:
 *               setupToken: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               confirmPassword: { type: string, minLength: 8 }
 *               email: { type: string, format: email, description: Optional }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/refresh:
 *   post:
 *     tags: ["Member — Auth"]
 *     summary: Refresh access token
 *     description: iOS `APIEndpoints.Auth.refreshToken` → `api/v1/auth/refresh`
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
 *
 * /api/v1/auth/2fa/send-otp:
 *   post:
 *     tags: ["Member — Auth"]
 *     summary: Send OTP (login step-up or authenticated actions)
 *     description: iOS `APIEndpoints.Auth.sendOtp` → `api/v1/auth/2fa/send-otp`
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
 *
 * /api/v1/auth/profile:
 *   get:
 *     tags: ["Member — Profile", "Staff — Profile"]
 *     summary: Get profile
 *     description: |
 *       Role-based profile response from JWT.
 *
 *       **Member:** `panel: member`, `headerStats` (vehicles, events, days, miles), membership tier,
 *       billing/membership/vehicle preference sections.
 *
 *       **Staff/Admin:** `panel: staff|admin`, `jobTitle`, work `headerStats`, account/security sections (no billing).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     role: { type: string, example: member }
 *                     panel: { type: string, example: member }
 *                     headerStats: { type: array, items: { type: object } }
 *                     sections: { type: object }
 *   patch:
 *     tags: ["Member — Profile", "Staff — Profile"]
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
 *               jobTitle: { type: string, description: Staff/admin }
 *               mobile: { type: string }
 *               mobileCountryCode: { type: string }
 *               residence: { type: string }
 *               address: { type: string }
 *               coverImageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/profile/billing:
 *   get:
 *     tags: ["Member — Profile"]
 *     summary: Get billing & membership summary
 *     description: Member billing section — payment methods, membership tier, invoices.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/profile/privacy:
 *   get:
 *     tags: ["Member — Profile", "Staff — Profile"]
 *     summary: Get privacy settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: ["Member — Profile", "Staff — Profile"]
 *     summary: Update privacy settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               biometricUnlockEnabled: { type: boolean }
 *               profileVisibility:
 *                 type: string
 *                 enum: [members_only, public, private]
 *               showAtClub: { type: boolean }
 *               eventsAttendanceVisibility:
 *                 type: string
 *                 enum: [members_only, public, private]
 *               vehicleVisibility:
 *                 type: string
 *                 enum: [members_only, public, private]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/profile/sessions:
 *   get:
 *     tags: ["Member — Profile", "Staff — Profile"]
 *     summary: List active sessions
 *     description: Returns signed-in devices/sessions for the current account.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/profile/membership-tiers:
 *   get:
 *     tags: ["Member — Profile"]
 *     summary: List membership tiers
 *     description: Available membership tiers for upgrade/display on profile.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/auth/profile/photo:
 *   post:
 *     tags: ["Member — Profile", "Staff — Profile"]
 *     summary: Upload profile photo
 *     description: Multipart field **`image`** (max 5 MB).
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
 *
 * /api/v1/auth/profile/cover:
 *   post:
 *     tags: ["Member — Profile"]
 *     summary: Upload cover image
 *     description: Multipart field **`coverImage`** (max 5 MB).
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
 *
 *
 * /api/v1/auth/change-password:
 *   post:
 *     tags: ["Member — Profile"]
 *     summary: Change password
 *     description: Requires current password. Optional OTP if 2FA enabled.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               otp: { type: string, pattern: '^\\d{6}$', description: Required when 2FA enabled }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/events:
 *   get:
 *     tags: ["Member — Events"]
 *     summary: List club events
 *     description: iOS `APIEndpoints.Events.list` → `api/v1/events`
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
 *
 *
 * /api/v1/events/my-diary:
 *   get:
 *     tags: ["Member — Events"]
 *     summary: My diary (joined events)
 *     description: iOS `APIEndpoints.Events.myDiary` → `api/v1/events/my-diary`
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/events/{id}/join:
 *   post:
 *     tags: ["Member — Events"]
 *     summary: Join event
 *     description: iOS `APIEndpoints.Events.join(id)` → `api/v1/events/{id}/join`
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/events/{id}/leave:
 *   delete:
 *     tags: ["Member — Events"]
 *     summary: Leave event
 *     description: iOS `APIEndpoints.Events.leave(id)` → `api/v1/events/{id}/leave` (HTTP DELETE)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/eventIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/vehicles:
 *   get:
 *     tags: ["Member — Vehicles"]
 *     summary: List My Garage vehicles
 *     description: |
 *       Returns member garage vehicles (`registrationStep: complete`).
 *
 *       After admin assigns a vehicle to a sourcing request, it appears here with status **In Review**
 *       (before member approve/reject). After approve → **Stored**. After reject → removed from list.
 *
 *       `POST /api/v1/vehicles` is **admin-only** — members use the sourcing flow instead.
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, priority, mine], default: mine }
 *       - in: query
 *         name: garageStatus
 *         schema: { type: string, enum: [all, ready, in_service, stored], example: all }
 *         description: Filter by garage tab (In Review vehicles use status `In review` on the vehicle record)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: vehicleType
 *         schema: { type: string, enum: [car, bike, other, cars, bikes] }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/vehicles/overview:
 *   get:
 *     tags: ["Member — Vehicles"]
 *     summary: My Garage overview screen
 *     description: |
 *       iOS `APIEndpoints.Vehicles.overview` → `api/v1/vehicles/overview`
 *
 *       Includes garage tabs, featured vehicle, and counts. Shows **In Review** vehicles after sourcing assign.
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryRequired'
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, priority, mine], default: mine }
 *       - in: query
 *         name: selectedVehicleId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/vehicles/{id}:
 *   get:
 *     tags: ["Member — Vehicles"]
 *     summary: Vehicle detail (garage bundle)
 *     description: |
 *       iOS `APIEndpoints.Vehicles.detail(id)` → `api/v1/vehicles/{id}`
 *
 *       Use `?include=health,documents,requests` for sub-resources. Assigned sourcing vehicles are viewable while In Review.
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *       - in: query
 *         name: include
 *         schema: { type: string, example: "health,documents,requests" }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/sourcing/my-requests:
 *   post:
 *     tags: ["Member — Sourcing"]
 *     summary: Submit sourcing request
 *     description: |
 *       **Member Bearer token required.** `memberId` is taken from JWT — do not send `memberId` in body.
 *
 *       Creates a sourcing request with status **Request received**. Admin/staff review and assign via admin endpoints.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [make, model]
 *             properties:
 *               make: { type: string, example: Ferrari }
 *               model: { type: string, example: SF90 }
 *               yearMin: { type: integer, example: 2020 }
 *               yearMax: { type: integer, example: 2024 }
 *               colour: { type: string, example: Rosso Corsa }
 *               trim: { type: string }
 *               specifications: { type: object }
 *               budgetMin: { type: integer, example: 500000 }
 *               budgetMax: { type: integer, example: 1200000 }
 *               currency: { type: string, default: AED }
 *               timelineNotes: { type: string }
 *               notes: { type: string }
 *           examples:
 *             sf90:
 *               summary: Ferrari SF90 request
 *               value:
 *                 make: Ferrari
 *                 model: SF90
 *                 yearMin: 2021
 *                 yearMax: 2024
 *                 colour: Rosso Corsa
 *                 budgetMin: 800000
 *                 budgetMax: 1500000
 *                 currency: AED
 *                 notes: Prefer low mileage, full service history
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/sourcing/requests:
 *   get:
 *     tags: ["Member — Sourcing"]
 *     summary: List sourcing requests
 *     description: iOS `APIEndpoints.Sourcing.requests`. Pass `memberId` to filter own requests.
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: ["Member — Sourcing"]
 *     summary: Submit sourcing request (legacy — requires memberId in body)
 *     description: Prefer **POST /api/v1/sourcing/my-requests** with Bearer token for members.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SourcingRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/sourcing/requests/{id}:
 *   get:
 *     tags: ["Member — Sourcing"]
 *     summary: Sourcing request detail
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/sourcing/requests/{id}/status:
 *   get:
 *     tags: ["Member — Sourcing"]
 *     summary: Sourcing request timeline and status
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/sourcing/requests/{id}/pending-vehicle:
 *   get:
 *     tags: ["Member — Sourcing"]
 *     summary: View assigned vehicle offer
 *     description: Returns the inventory vehicle admin assigned, pending member approval. Owner only (JWT).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         description: No pending assignment
 *
 *
 * /api/v1/sourcing/requests/{id}/approve-vehicle:
 *   post:
 *     tags: ["Member — Sourcing"]
 *     summary: Approve assigned vehicle (add to garage)
 *     description: |
 *       Accepts the admin-assigned vehicle. Sets `ownershipType: member`, status **Stored**, request **Completed**.
 *       Vehicle remains in **GET /api/v1/vehicles** garage listing.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/sourcing/requests/{id}/reject-vehicle:
 *   post:
 *     tags: ["Member — Sourcing"]
 *     summary: Reject assigned vehicle
 *     description: |
 *       Declines the offer. Vehicle returns to admin inventory and is **removed** from member garage listing.
 *       Sourcing request returns to **Searching for vehicle** for a new assignment.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason: { type: string, example: "Colour does not match preference" }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/sourcing/requests/{id}/cancel:
 *   patch:
 *     tags: ["Member — Sourcing"]
 *     summary: Cancel sourcing request
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/chat/initiate:
 *   post:
 *     tags: ["Member — Chat"]
 *     summary: "Member — start concierge chat"
 *     description: |
 *       Creates a Firestore conversation with the concierge team if one does not exist.
 *       Optional `initialMessage` is sent as the first member message.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initialMessage:
 *                 type: string
 *                 example: I need help scheduling transport for my Ferrari
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *       200:
 *         description: Conversation already existed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *
 *
 * /api/v1/chat/conversation:
 *   get:
 *     tags: ["Member — Chat"]
 *     summary: "Member — get conversation metadata"
 *     description: |
 *       iOS `APIEndpoints.Concierge.conversations` maps here.
 *       Auto-initiates chat if none exists yet.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/chat/messages:
 *   get:
 *     tags: ["Member — Chat"]
 *     summary: "Member — list messages"
 *     description: |
 *       iOS `APIEndpoints.Concierge.messages` maps here.
 *       Returns messages from Firestore for the member's concierge thread.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: ["Member — Chat"]
 *     summary: "Member — send message"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *                 example: Can you arrange pickup from storage tomorrow?
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/chat/read:
 *   patch:
 *     tags: ["Member — Chat"]
 *     summary: "Member — mark conversation as read"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/transport/service-types:
 *   get:
 *     tags: ["Member — Transport"]
 *     summary: Transport service types
 *     description: iOS `APIEndpoints.Transport.serviceTypes`
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/transport/requests:
 *   get:
 *     tags: ["Member — Transport"]
 *     summary: List transport requests
 *     description: iOS `APIEndpoints.Transport.requests`
 *     parameters:
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: ["Member — Transport"]
 *     summary: Create transport request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransportRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/transport/requests/{id}:
 *   get:
 *     tags: ["Member — Transport"]
 *     summary: Transport request detail
 *     description: iOS `APIEndpoints.Transport.request(id)`
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *       - $ref: '#/components/parameters/memberIdQueryOptional'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/detailing/catalog:
 *   get:
 *     tags: ["Member — Detailing"]
 *     summary: Detailing catalog
 *     description: iOS `APIEndpoints.Detailing.catalog`
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/detailing/bookings:
 *   get:
 *     tags: ["Member — Detailing"]
 *     summary: List detailing bookings
 *     description: iOS `APIEndpoints.Detailing.bookings`
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
 *     tags: ["Member — Detailing"]
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
 *
 * /api/v1/maintenance/catalog:
 *   get:
 *     tags: ["Member — Maintenance"]
 *     summary: Maintenance catalog
 *     description: iOS `APIEndpoints.Maintenance.catalog`
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/maintenance/requests:
 *   get:
 *     tags: ["Member — Maintenance"]
 *     summary: List maintenance requests
 *     description: iOS `APIEndpoints.Maintenance.requests`
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
 *     tags: ["Member — Maintenance"]
 *     summary: Create maintenance request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceRequestBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/notifications/devices:
 *   post:
 *     tags: ["Member — Notifications"]
 *     summary: Register push device (FCM token)
 *     description: iOS `APIEndpoints.Notifications.registerDevice`
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, platform]
 *             properties:
 *               token: { type: string }
 *               platform: { type: string, enum: [ios, android, web] }
 *               deviceId: { type: string }
 *               appVersion: { type: string }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/notifications/inbox:
 *   get:
 *     tags: ["Member — Notifications"]
 *     summary: Notification inbox
 *     description: iOS `APIEndpoints.Notifications.inbox`
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
 *
 * /api/v1/notifications/inbox/read-all:
 *   post:
 *     tags: ["Member — Notifications"]
 *     summary: Mark all notifications read
 *     description: iOS `APIEndpoints.Notifications.readAllInbox`
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: ["Member — Notifications"]
 *     summary: Mark all notifications read (PATCH)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/notifications/inbox/{id}/read:
 *   post:
 *     tags: ["Member — Notifications"]
 *     summary: Mark one notification read
 *     description: iOS `APIEndpoints.Notifications.readInboxItem(id)`
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/inboxIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: ["Member — Notifications"]
 *     summary: Mark one notification read (PATCH)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/inboxIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 
 */

module.exports = {};
