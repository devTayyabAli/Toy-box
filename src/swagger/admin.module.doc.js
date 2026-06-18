/**
 * @openapi
 * /api/v1/auth/invitations:
 *   post:
 *     tags: ["Admin — Auth"]
 *     summary: Admin — invite member or staff (requires login first)
 *     description: |
 *       **Admin only** — run **`POST /api/v1/auth/sign-in`** first (admin login).
 *       Bearer token is sent automatically after sign-in, or paste via **Authorize**.
 *       Creates a pending account and emails a 6-digit OTP (`verify-otp` → `setup-password`).
 *       Use `role`: `member` or `staff` on the same endpoint.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, staff]
 *                 example: member
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               firstName: { type: string, example: John }
 *               lastName: { type: string, example: Doe }
 *               jobTitle:
 *                 type: string
 *                 description: Staff invites only
 *                 example: Concierge
 *               membershipTier:
 *                 type: string
 *                 description: Member invites only (alias of designation)
 *                 example: principal
 *               designation:
 *                 type: string
 *                 description: Member tier label from invite modal
 *                 example: Black Card Member
 *               fullName:
 *                 type: string
 *                 description: Full name (alternative to firstName/lastName)
 *                 example: Layla Robert
 *               validityMonths:
 *                 type: integer
 *                 enum: [6, 12, 24, 36]
 *                 default: 12
 *                 description: Membership validity period in months
 *               mobile: { type: string }
 *               mobileCountryCode: { type: string, example: "+971" }
 *               displayHandle: { type: string, description: Member only }
 *               residence: { type: string }
 *           examples:
 *             member:
 *               summary: Invite member
 *               value:
 *                 role: member
 *                 email: member@example.com
 *                 fullName: Layla Robert
 *                 designation: Black Card Member
 *                 validityMonths: 12
 *             staff:
 *               summary: Invite staff
 *               value:
 *                 role: staff
 *                 email: staff@example.com
 *                 firstName: Jane
 *                 lastName: Smith
 *                 jobTitle: Concierge
 *     responses:
 *       201:
 *         description: Invitation sent — OTP emailed
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
 *                     panel: { type: string }
 *                     invitationSent: { type: boolean }
 *                     otpSentTo: { type: string, description: Masked email }
 *                     user: { type: object }
 *       403:
 *         description: Admin role required
 *       409:
 *         description: Email already registered
 *
 *
 * /api/v1/auth/invitations/resend:
 *   post:
 *     tags: ["Admin — Auth"]
 *     summary: Resend invitation activation OTP
 *     description: |
 *       Resends the 6-digit activation code to a pending invite (account not yet activated).
 *       Requires admin Bearer token.
 *     security: [{ bearerAuth: [] }]
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
 *       404:
 *         description: User not found
 *
 *
 * /api/v1/admin/members/summary:
 *   get:
 *     tags: ["Admin — Members"]
 *     summary: Members directory summary stats
 *     description: |
 *       KPI cards for the Members directory screen (admin & staff panel):
 *       total members, VIP tier count, on premises, retention YTD.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/members:
 *   get:
 *     tags: ["Admin — Members"]
 *     summary: List members directory
 *     description: |
 *       Paginated member cards with tier, stats (vehicles, events, miles, days), and last seen.
 *       Filter by tier: `all`, `access`, `private`, `principal`, `black_card`.
 *       **Admin & staff** use this same route (`/api/v1/admin/members`).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *           enum: [all, access, private, principal, black_card]
 *           default: all
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/members/invite:
 *   post:
 *     tags: ["Admin — Members"]
 *     summary: Invite member (directory modal)
 *     description: |
 *       Sends invitation OTP email. Matches the **Invite Member** modal:
 *       `fullName`, `email`, `designation` (tier), `validityMonths`.
 *       Available to **admin and staff** Bearer tokens.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, fullName, designation]
 *             properties:
 *               email: { type: string, format: email, example: name@example.com }
 *               fullName: { type: string, example: Layla Robert }
 *               designation:
 *                 type: string
 *                 example: Black Card Member
 *                 description: access | private | principal | black_card (or label)
 *               validityMonths:
 *                 type: integer
 *                 enum: [6, 12, 24, 36]
 *                 default: 12
 *               mobile: { type: string }
 *               residence: { type: string }
 *               displayHandle: { type: string }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/admin/members/{id}:
 *   get:
 *     tags: ["Admin — Members"]
 *     summary: Get member profile (admin/staff view)
 *     description: |
 *       Full member profile for the directory detail screen.
 *       **Admin & staff** use this same route.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         description: Member not found
 *
 *
 * /api/v1/admin/staff/summary:
 *   get:
 *     tags: ["Admin — Staff"]
 *     summary: Staff directory summary stats
 *     description: |
 *       KPI cards for the admin Staff directory:
 *       total staff, active accounts, pending activation, invited this month.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/staff:
 *   get:
 *     tags: ["Admin — Staff"]
 *     summary: List staff directory
 *     description: |
 *       Paginated staff cards with job title, account status, and last seen.
 *       Filter by status: `all`, `active`, `pending_activation`.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, pending_activation]
 *           default: all
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/staff/invite:
 *   post:
 *     tags: ["Admin — Staff"]
 *     summary: Invite staff operative
 *     description: |
 *       Sends invitation OTP email for a new staff account.
 *       Matches the **Invite Staff** modal: `firstName`, `lastName`, `email`, `jobTitle`.
 *       **Admin only.**
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, jobTitle]
 *             properties:
 *               email: { type: string, format: email, example: staff@example.com }
 *               firstName: { type: string, example: Jane }
 *               lastName: { type: string, example: Smith }
 *               jobTitle: { type: string, example: Senior Operative }
 *               mobile: { type: string }
 *               mobileCountryCode: { type: string, example: "+971" }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *       403:
 *         description: Admin role required
 *
 *
 * /api/v1/admin/staff/{id}:
 *   get:
 *     tags: ["Admin — Staff"]
 *     summary: Get staff profile (admin view)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         description: Staff member not found
 *
 *
 * /api/v1/admin/vehicles:
 *   get:
 *     tags: ["Admin — Vehicles"]
 *     summary: Admin vehicles page — summary, bay map, and operations table
 *     description: |
 *       Staff/admin vehicle management page. Returns:
 *       - **dashboardSummary** — Total Vehicles, In Storage, In Service, Bay Utilization (Figma cards)
 *       - **bayMap** — Level 01 grid (A01–A10, B01–B03) with occupied/empty slots
 *       - **operations** — table rows (bay, member, vehicle, status, lastActivity)
 *       - **summary** — legacy fleet stats (ready, overdue service, etc.)
 *       - **vehicles** — paginated fleet list (same rows as operations)
 *
 *       Filter by summary card using `summaryKey`: `ready`, `in_service`, `in_storage`, or `overdue_service`.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: storageBay
 *         schema: { type: string }
 *         description: Filter by storage bay / wing (e.g. A02)
 *       - in: query
 *         name: summaryKey
 *         schema:
 *           type: string
 *           enum: [ready, in_service, in_storage, overdue_service]
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [01], default: "01" }
 *         description: Bay map level (currently Level 01)
 *       - in: query
 *         name: includeBayMap
 *         schema: { type: string, enum: [true, false], default: true }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Fleet vehicles page payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     dashboardSummary:
 *                       type: object
 *                       properties:
 *                         totalVehicles:
 *                           type: object
 *                           properties:
 *                             key: { type: string, example: total }
 *                             label: { type: string, example: "TOTAL VEHICLES" }
 *                             value: { type: integer, example: 287 }
 *                             subLabel: { type: string, example: ACTIVE }
 *                             trend:
 *                               type: object
 *                               properties:
 *                                 direction: { type: string, enum: [up, down, flat] }
 *                                 value: { type: integer, example: 4 }
 *                                 displayValue: { type: string, example: "^+4" }
 *                         inStorage:
 *                           type: object
 *                           properties:
 *                             key: { type: string, example: in_storage }
 *                             label: { type: string, example: "IN STORAGE" }
 *                             value: { type: integer, example: 12 }
 *                             subLabel: { type: string, example: WORKSHOP }
 *                         inService:
 *                           type: object
 *                           properties:
 *                             key: { type: string, example: in_service }
 *                             label: { type: string, example: "IN SERVICE" }
 *                             value: { type: integer, example: 3 }
 *                             subLabel: { type: string, example: "SERVICE WINDOW" }
 *                         bayUtilization:
 *                           type: object
 *                           properties:
 *                             key: { type: string, example: bay_utilization }
 *                             label: { type: string, example: "BAY UTILIZATION" }
 *                             value: { type: integer, example: 90 }
 *                             displayValue: { type: string, example: "90%" }
 *                             ratio:
 *                               type: object
 *                               properties:
 *                                 used: { type: integer, example: 287 }
 *                                 total: { type: integer, example: 320 }
 *                                 displayValue: { type: string, example: "287 / 320" }
 *                             trend:
 *                               type: object
 *                               properties:
 *                                 direction: { type: string, enum: [up, down, flat] }
 *                                 value: { type: integer, example: 2 }
 *                                 displayValue: { type: string, example: "^+2%" }
 *                     bayMap:
 *                       type: object
 *                       properties:
 *                         level: { type: string, example: "01" }
 *                         label: { type: string, example: "Level 01" }
 *                         bays:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id: { type: string, example: A02 }
 *                               label: { type: string, example: A02 }
 *                               occupied: { type: boolean }
 *                               vehicleId: { type: integer, nullable: true }
 *                               statusKey: { type: string, example: in_service }
 *                     operations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           bay: { type: string, example: A02 }
 *                           member:
 *                             type: object
 *                             properties:
 *                               id: { type: integer }
 *                               name: { type: string, example: "Marcus W." }
 *                               profileImageUrl: { type: string, nullable: true }
 *                           vehicle:
 *                             type: object
 *                             properties:
 *                               id: { type: integer }
 *                               displayName: { type: string, example: "Porsche 911 GT3" }
 *                           statusLabel: { type: string, example: "IN SERVICE" }
 *                           lastActivity:
 *                             type: object
 *                             properties:
 *                               label: { type: string, example: "Service started 27 Apr" }
 *                               at: { type: string, format: date-time }
 *                     summary:
 *                       type: object
 *                       description: Legacy fleet summary cards
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total: { type: integer }
 *                     limit: { type: integer }
 *                     offset: { type: integer }
 *
 *
 * /api/v1/admin/vehicles/{id}:
 *   get:
 *     tags: ["Admin — Vehicles"]
 *     summary: Get vehicle details (VIEW action)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *       404:
 *         description: Vehicle not found
 *
 *
 * /api/v1/admin/vehicles/inventory/wizard/schema:
 *   get:
 *     tags: ["Admin — Inventory"]
 *     summary: Add-vehicle form schema
 *     description: Returns wizard steps, fields, and document keys for inventory vehicles.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/vehicles/inventory:
 *   post:
 *     tags: ["Admin — Inventory"]
 *     summary: Add vehicle to inventory catalog
 *     description: |
 *       **Admin or staff Bearer token required.**
 *
 *       Adds a vehicle to the admin inventory (`ownershipType: inventory`, not in any member garage yet).
 *       Used before assigning to a member sourcing request.
 *
 *       **JSON:** send `vehicleInfo`, `ownershipInfo`, `health`, optional `documents` URLs.
 *
 *       **Multipart:** flat fields + document files (`vehicleRegistration`, `insuranceCertificate`, etc.) + optional `vehicleImage`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleInfo, ownershipInfo, health]
 *             properties:
 *               vehicleInfo:
 *                 $ref: '#/components/schemas/VehicleInfo'
 *               ownershipInfo:
 *                 $ref: '#/components/schemas/VehicleOwnershipInfo'
 *               health:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/VehicleHealthItem'
 *               documents:
 *                 type: object
 *                 properties:
 *                   vehicleRegistration: { type: string, format: uri }
 *                   insuranceCertificate: { type: string, format: uri }
 *                   specsAndInfo: { type: string, format: uri }
 *                   serviceRecord: { type: string, format: uri }
 *                   purchasedInvoice: { type: string, format: uri }
 *                   warrantyCertificate: { type: string, format: uri }
 *               status: { type: string, example: Stored }
 *               isPriority: { type: boolean }
 *               imageUrl: { type: string, format: uri }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               make: { type: string, example: Ferrari }
 *               model: { type: string, example: SF90 }
 *               year: { type: integer, example: 2023 }
 *               engine: { type: string }
 *               power: { type: string }
 *               transmission: { type: string }
 *               drive: { type: string }
 *               zeroToHundred: { type: string }
 *               topSpeed: { type: string }
 *               colour: { type: string }
 *               chassisNo: { type: string }
 *               plate: { type: string }
 *               purchasedAt: { type: string, example: "2023-01-01" }
 *               storageBay: { type: string }
 *               mileage: { type: string }
 *               vehicleRegistration: { type: string, format: binary }
 *               insuranceCertificate: { type: string, format: binary }
 *               vehicleImage: { type: string, format: binary }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   get:
 *     tags: ["Admin — Inventory"]
 *     summary: "Admin/Staff: list inventory vehicles"
 *     description: |
 *       Lists all catalog vehicles (`ownershipType: inventory`), including those already offered on sourcing requests.
 *       Returns the same **summary** stats shape as `GET /api/v1/admin/vehicles` (scoped to inventory only).
 *       Use the vehicle **id** as **vehicleId** when assigning.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/vehicles/inventory/{id}:
 *   get:
 *     tags: ["Admin — Inventory"]
 *     summary: "Admin/Staff: inventory vehicle detail"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: ["Admin — Inventory"]
 *     summary: "Admin/Staff: update inventory vehicle"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: ["Admin — Inventory"]
 *     summary: "Admin/Staff: delete inventory vehicle"
 *     description: Blocked if vehicle has a pending member assignment.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/sourcing/requests:
 *   get:
 *     tags: ["Admin — Sourcing"]
 *     summary: Job confirmations page (list + KPIs + side panels)
 *     description: |
 *       Returns summary KPI cards, pending confirmations list, **inReviewBookings** (right panel),
 *       and **staffOnDuty** (team on duty). Filter by member, status, or search make/model/reference.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "Request received" }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Sourcing requests with job confirmation summary stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         pendingConfirm:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 5 }
 *                             subtitle: { type: string, example: Awaiting your action }
 *                         signOffQueue:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 3 }
 *                             subtitle: { type: string }
 *                         completedToday:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 9 }
 *                             subtitle: { type: string }
 *                         shiftProgress:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 87 }
 *                             unit: { type: string, example: percent }
 *                         inReview:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 3 }
 *                             subtitle: { type: string }
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           confirmationStatus:
 *                             type: string
 *                             enum: [pending, in_review, completed, cancelled]
 *                           canOfferVehicle: { type: boolean }
 *                           pendingOffer:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               offerStartDate: { type: string, format: date, example: "2026-07-17" }
 *                               offerEndDate: { type: string, format: date, example: "2026-07-24" }
 *                               preferredDates:
 *                                 type: object
 *                                 properties:
 *                                   start: { type: string, format: date }
 *                                   end: { type: string, format: date }
 *                     total: { type: integer }
 *                     limit: { type: integer }
 *                     offset: { type: integer }
 *
 *
 * /api/v1/admin/sourcing/summary:
 *   get:
 *     tags: ["Admin — Sourcing"]
 *     summary: Job confirmation KPI cards only
 *     description: Same summary object returned inside GET /api/v1/admin/sourcing/requests.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/sourcing/requests/{id}/offer-options:
 *   get:
 *     tags: ["Admin — Sourcing"]
 *     summary: Offer a Vehicle modal — vehicle & member dropdowns
 *     description: |
 *       Populates the **Offer a Vehicle** modal with inventory vehicles and the member on this request.
 *       Same as GET /api/v1/staff/sourcing/requests/{id}/offer-options.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         description: Form options for offer modal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId: { type: integer }
 *                     member:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         name: { type: string, example: "Nora Assenmio" }
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           label: { type: string, example: "Lamborghini Huracán STO" }
 *       404:
 *         description: Sourcing request not found
 *
 *
 * /api/v1/admin/sourcing/requests/{id}:
 *   get:
 *     tags: ["Admin — Sourcing"]
 *     summary: "Admin/Staff: sourcing request detail + assignment history"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/sourcing/requests/{id}/assignments:
 *   get:
 *     tags: ["Admin — Sourcing"]
 *     summary: "Admin/Staff: list vehicle assignments for a request"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/sourcing/requests/{id}/assign:
 *   post:
 *     tags: ["Admin — Sourcing"]
 *     summary: Assign inventory vehicle to request (Offer a Vehicle / Send Offer)
 *     description: |
 *       Assigns a vehicle from **GET /api/v1/admin/vehicles/inventory** to this sourcing request.
 *
 *       - Creates `SourcingVehicleAssignment` with status `pending_member_approval`
 *       - Same inventory vehicle may be offered on multiple sourcing requests
 *       - Vehicle stays in inventory; member sees the offer in garage via pending assignment
 *       - Sends push notification to member
 *
 *       Member then calls `GET .../pending-vehicle` → `approve-vehicle` or `reject-vehicle`.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, memberId, offerStartDate, offerEndDate]
 *             properties:
 *               vehicleId:
 *                 type: integer
 *                 example: 4
 *                 description: Id from GET /api/v1/admin/vehicles/inventory
 *               memberId:
 *                 type: integer
 *                 example: 32
 *                 description: Member receiving the offer (must match the sourcing request member)
 *               offerStartDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-17"
 *                 description: Preferred offer start date (matches Offer a Vehicle modal)
 *               offerEndDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-24"
 *                 description: Preferred offer end date
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Alias for offerStartDate
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Alias for offerEndDate
 *               adminNotes:
 *                 type: string
 *                 example: Matches member budget and specs
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/admin/chat/initiate:
 *   post:
 *     tags: ["Admin — Chat"]
 *     summary: "Admin — start chat with a member"
 *     description: Creates or opens a concierge conversation for the given member and sends a welcome message.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: integer
 *                 example: 5
 *               initialMessage:
 *                 type: string
 *                 example: Hi — how can we help with your garage today?
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/admin/chat/conversations:
 *   get:
 *     tags: ["Admin — Chat"]
 *     summary: "Admin — list all member conversations"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, closed], default: active }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/admin/chat/{memberId}/messages:
 *   get:
 *     tags: ["Admin — Chat"]
 *     summary: "Admin — list messages for a member"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/messagesMemberIdPath'
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   post:
 *     tags: ["Admin — Chat"]
 *     summary: "Admin — send message to member"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/messagesMemberIdPath'
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
 *                 example: Your transport request has been confirmed for Friday.
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/admin/chat/{memberId}/read:
 *   patch:
 *     tags: ["Admin — Chat"]
 *     summary: "Admin — mark member conversation as read"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/messagesMemberIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 */

module.exports = {};
