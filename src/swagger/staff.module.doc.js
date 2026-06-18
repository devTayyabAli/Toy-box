/**
 * @openapi
 * /api/v1/staff/overview:
 *   get:
 *     tags: ["Staff — Overview"]
 *     summary: Staff dashboard overview
 *     description: |
 *       Returns the staff home screen payload: KPIs, quick actions, priority tasks,
 *       today's schedule, system alerts, staff on duty, shift stats, and current assignment.
 *       Requires staff or admin Bearer token.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff overview dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Staff overview }
 *                 data:
 *                   type: object
 *                   properties:
 *                     staff:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         name: { type: string, example: Katherine M. }
 *                         role: { type: string, example: staff }
 *                         jobTitle: { type: string, example: Senior Operative }
 *                         status: { type: string, example: active }
 *                     shift:
 *                       type: object
 *                       properties:
 *                         label: { type: string, example: Morning Shift }
 *                         displayDate: { type: string }
 *                         startTime: { type: string, example: "07:00" }
 *                         endTime: { type: string, example: "15:00" }
 *                         timeRemainingLabel: { type: string, example: "5h 18m" }
 *                     kpis:
 *                       type: object
 *                     quickActions:
 *                       type: array
 *                       items: { type: object }
 *                     priorityTasks:
 *                       type: object
 *                     schedule:
 *                       type: object
 *                     systemAlerts:
 *                       type: object
 *                     staffOnDuty:
 *                       type: array
 *                       items: { type: object }
 *                     shiftStats:
 *                       type: object
 *                     yourAssignment:
 *                       type: object
 *                       nullable: true
 *       403:
 *         description: Staff or admin role required
 *
 *
 * /api/v1/staff/sourcing/summary:
 *   get:
 *     tags: ["Staff — Sourcing"]
 *     summary: Job confirmation KPI cards only
 *     description: Same summary object as GET /api/v1/staff/sourcing/requests (pending confirm, sign-off queue, completed today, shift progress, in review).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/sourcing/requests:
 *   get:
 *     tags: ["Staff — Sourcing"]
 *     summary: Job confirmations page (list + KPIs + side panels)
 *     description: |
 *       Staff **Confirmations** screen. Returns:
 *       - **summary** — Pending Confirm, Sign-off Queue, Completed Today, Shift Progress, In Review
 *       - **requests** — pending confirmations list with `canOfferVehicle` and `confirmationStatus`
 *       - **inReviewBookings** — right panel (member + vehicle + preferred dates)
 *       - **staffOnDuty** — team on duty panel
 *
 *       Same payload as GET /api/v1/admin/sourcing/requests.
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
 *                         completedToday:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 9 }
 *                         shiftProgress:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 87 }
 *                             unit: { type: string, example: percent }
 *                         inReview:
 *                           type: object
 *                           properties:
 *                             value: { type: integer, example: 3 }
 *                     inReviewBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           sourcingRequestId: { type: integer }
 *                           member:
 *                             type: object
 *                             properties:
 *                               id: { type: integer }
 *                               name: { type: string, example: "Alex Mitchell" }
 *                               profileImageUrl: { type: string, nullable: true }
 *                           vehicle:
 *                             type: object
 *                             properties:
 *                               displayName: { type: string, example: "Rolls-Royce Spectre" }
 *                           preferredDates:
 *                             type: object
 *                             properties:
 *                               start: { type: string, format: date }
 *                               end: { type: string, format: date }
 *                     staffOnDuty:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           name: { type: string, example: "Khalid M." }
 *                           role: { type: string }
 *                           status: { type: string, example: active }
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
 *                               offerStartDate: { type: string, format: date }
 *                               offerEndDate: { type: string, format: date }
 *                     total: { type: integer }
 *                     limit: { type: integer }
 *                     offset: { type: integer }
 *
 *
 * /api/v1/staff/sourcing/requests/{id}/offer-options:
 *   get:
 *     tags: ["Staff — Sourcing"]
 *     summary: Offer a Vehicle modal — vehicle & member dropdowns
 *     description: |
 *       Populates the **Offer a Vehicle** modal: inventory vehicles list and the member on this request.
 *       Same as GET /api/v1/admin/sourcing/requests/{id}/offer-options.
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
 *                     referenceNumber: { type: string }
 *                     member:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 32 }
 *                         name: { type: string, example: "Nora Assenmio" }
 *                         profileImageUrl: { type: string, nullable: true }
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 4 }
 *                           label: { type: string, example: "Lamborghini Huracán STO" }
 *                           make: { type: string }
 *                           model: { type: string }
 *                           year: { type: integer }
 *       404:
 *         description: Sourcing request not found
 *
 *
 * /api/v1/staff/sourcing/requests/{id}:
 *   get:
 *     tags: ["Staff — Sourcing"]
 *     summary: Sourcing request detail with assignments
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/sourcing/requests/{id}/assignments:
 *   get:
 *     tags: ["Staff — Sourcing"]
 *     summary: List vehicle assignments for a sourcing request
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/sourcing/requests/{id}/assign:
 *   post:
 *     tags: ["Staff — Sourcing"]
 *     summary: Offer a vehicle to a member (SEND OFFER)
 *     description: |
 *       Staff **Offer a Vehicle** / **Send Offer** action. Same as POST /api/v1/admin/sourcing/requests/{id}/assign.
 *
 *       - Creates `SourcingVehicleAssignment` with status `pending_member_approval`
 *       - Requires vehicle, member, and preferred offer dates (start/end)
 *       - Sends push notification to member for approval
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
 *                 description: From GET .../offer-options or GET /api/v1/staff/vehicles/inventory
 *               memberId:
 *                 type: integer
 *                 example: 32
 *                 description: Member receiving the offer (must match the sourcing request member)
 *               offerStartDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-17"
 *               offerEndDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-24"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Alias for offerStartDate
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Alias for offerEndDate
 *               adminNotes: { type: string }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/staff/confirmations:
 *   get:
 *     tags: ["Staff — Confirmations"]
 *     summary: Job confirmations page (alias)
 *     description: Alias for GET /api/v1/staff/sourcing/requests — same payload.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string }
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
 * /api/v1/staff/confirmations/summary:
 *   get:
 *     tags: ["Staff — Confirmations"]
 *     summary: Confirmation KPI cards only
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/confirmations/{id}/offer-options:
 *   get:
 *     tags: ["Staff — Confirmations"]
 *     summary: Offer a Vehicle modal options (alias)
 *     description: Alias for GET /api/v1/staff/sourcing/requests/{id}/offer-options.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/requestIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/confirmations/{id}/offer:
 *   post:
 *     tags: ["Staff — Confirmations"]
 *     summary: Send vehicle offer (alias)
 *     description: Alias for POST /api/v1/staff/sourcing/requests/{id}/assign — **Send Offer** button.
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
 *               vehicleId: { type: integer, example: 4 }
 *               memberId: { type: integer, example: 32 }
 *               offerStartDate: { type: string, format: date, example: "2026-07-17" }
 *               offerEndDate: { type: string, format: date, example: "2026-07-24" }
 *               adminNotes: { type: string }
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/staff/vehicles:
 *   get:
 *     tags: ["Staff — Vehicles"]
 *     summary: Admin vehicles page — summary, bay map, operations table
 *     description: Same payload as GET /api/v1/admin/vehicles (dashboardSummary, bayMap, operations, vehicles).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: storageBay
 *         schema: { type: string }
 *       - in: query
 *         name: summaryKey
 *         schema:
 *           type: string
 *           enum: [ready, in_service, in_storage, overdue_service]
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
 * /api/v1/staff/vehicles/inventory/wizard/schema:
 *   get:
 *     tags: ["Staff — Inventory"]
 *     summary: Add-vehicle form schema
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/vehicles/inventory:
 *   post:
 *     tags: ["Staff — Inventory"]
 *     summary: Add vehicle to inventory catalog
 *     description: Same as POST /api/v1/admin/vehicles/inventory (JSON or multipart).
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
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *   get:
 *     tags: ["Staff — Inventory"]
 *     summary: List inventory vehicles
 *     description: Same as GET /api/v1/admin/vehicles/inventory.
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
 * /api/v1/staff/vehicles/inventory/{id}:
 *   get:
 *     tags: ["Staff — Inventory"]
 *     summary: Get inventory vehicle by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: ["Staff — Inventory"]
 *     summary: Update inventory vehicle
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   delete:
 *     tags: ["Staff — Inventory"]
 *     summary: Delete inventory vehicle
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/vehicleIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 *
 * /api/v1/staff/chat/initiate:
 *   post:
 *     tags: ["Staff — Chat"]
 *     summary: Start chat with a member
 *     description: Same as POST /api/v1/admin/chat/initiate.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: integer, example: 5 }
 *               initialMessage:
 *                 type: string
 *                 example: Hi — how can we help with your garage today?
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success201'
 *
 *
 * /api/v1/staff/chat/conversations:
 *   get:
 *     tags: ["Staff — Chat"]
 *     summary: List all member conversations
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
 * /api/v1/staff/chat/{memberId}/messages:
 *   get:
 *     tags: ["Staff — Chat"]
 *     summary: List messages for a member
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
 *     tags: ["Staff — Chat"]
 *     summary: Send message to member
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
 * /api/v1/staff/chat/{memberId}/read:
 *   patch:
 *     tags: ["Staff — Chat"]
 *     summary: Mark member conversation as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/messagesMemberIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 */

module.exports = {};
