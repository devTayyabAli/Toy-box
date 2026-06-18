const path = require("path");
const fs = require("fs");
require("./config/env");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const {
  swaggerRequestInterceptor,
  swaggerResponseInterceptor,
} = require("./swagger/swaggerUiAuth");

const PORT = process.env.PORT || 5000;
const LOCAL_URL = `http://localhost:${PORT}`;
const PUBLIC_URL = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const PUBLIC_URL_VALID = /^https?:\/\/.+/i.test(PUBLIC_URL);

function isPlaceholderPublicUrl(url) {
  return /your-subdomain|example\.com|changeme|placeholder/i.test(String(url || ""));
}

// Relative URL = Swagger always calls the same host you opened (localhost OR ngrok).
// Avoids "Failed to fetch" when https ngrok page tries http://localhost.
function buildServersList(req) {
  const current = req ? resolveRequestBaseUrl(req) : null;
  const servers = [];
  const seen = new Set();

  function add(url, description) {
    const normalized = String(url || "").replace(/\/$/, "");
    if (!normalized || seen.has(normalized)) return;
    if (normalized !== "/" && !/^https?:\/\//i.test(normalized)) return;
    seen.add(normalized);
    servers.push({ url: normalized, description });
  }

  // Default Try it out target: the host serving this Swagger page.
  if (current) {
    add(current, `Current host (${current})`);
  } else {
    add("/", "Current host (same origin as this page)");
  }

  if (PUBLIC_URL_VALID && !isPlaceholderPublicUrl(PUBLIC_URL) && PUBLIC_URL !== current) {
    add(PUBLIC_URL, `Public URL (${PUBLIC_URL})`);
  }

  if (LOCAL_URL !== current) {
    add(LOCAL_URL, `Local development (${LOCAL_URL})`);
  }

  return servers;
}

const servers = buildServersList();

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Toybox API",
      version: "1.0.0",
      description:
        "Toybox API docs grouped by **Member**, **Admin**, and **Staff** modules.\n\n" +
        "### Response envelope\n" +
        "`{ success, message, data, timestamp }`\n\n" +
        "### Bearer token\n" +
        "Paste `accessToken` from sign-in into **Authorize** for protected routes.\n\n" +
        "### Modules\n" +
        "- **Member** — mobile app (garage, sourcing, chat, events, services)\n" +
        "- **Admin** — invites, inventory, sourcing review, concierge chat\n" +
        "- **Staff** — inventory, sourcing review, concierge chat (`/api/v1/admin/*`)\n\n" +
        "### Sourcing flow\n" +
        "1. Admin/Staff add inventory vehicle\n" +
        "2. Member submits sourcing request\n" +
        "3. Admin/Staff assign vehicle\n" +
        "4. Member sees vehicle In Review → approve or reject\n\n" +
        (PUBLIC_URL_VALID
          ? `**Share docs:** ${PUBLIC_URL}/api-docs\n\n`
          : "") +
        `Local: ${LOCAL_URL}/api-docs`,
    },
    servers,
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Member — Auth", description: "Member sign-in, refresh, 2FA, activation" },
      { name: "Member — Profile", description: "Profile read/update and photo" },
      { name: "Member — Events", description: "Club events" },
      { name: "Member — Vehicles", description: "My Garage listing and detail" },
      { name: "Member — Sourcing", description: "Submit and track sourcing requests" },
      { name: "Member — Chat", description: "Concierge chat" },
      { name: "Member — Transport", description: "Transport requests" },
      { name: "Member — Detailing", description: "Detailing bookings" },
      { name: "Member — Maintenance", description: "Maintenance requests" },
      { name: "Member — Notifications", description: "Push and inbox" },
      { name: "Admin — Auth", description: "Admin sign-in and invitations" },
      { name: "Admin — Members", description: "Members directory, stats, and invites" },
      { name: "Admin — Staff", description: "Staff directory, stats, and invites" },
      { name: "Admin — Inventory", description: "Vehicle catalog (add/list/edit)" },
      { name: "Admin — Vehicles", description: "Fleet vehicle listing with summary stats" },
      { name: "Admin — Sourcing", description: "Review requests and assign vehicles" },
      { name: "Admin — Chat", description: "Concierge conversations with members" },
      { name: "Staff — Auth", description: "Staff sign-in" },
      { name: "Staff — Overview", description: "Staff dashboard home screen" },
      { name: "Staff — Profile", description: "Staff profile (same /auth/profile routes, role-based response)" },
      { name: "Staff — Inventory", description: "Vehicle catalog under /api/v1/staff/vehicles/inventory" },
      { name: "Staff — Vehicles", description: "Fleet vehicle listing under /api/v1/staff/vehicles" },
      { name: "Staff — Sourcing", description: "Job confirmations and vehicle offers under /api/v1/staff/sourcing" },
      { name: "Staff — Confirmations", description: "Confirmations UI aliases under /api/v1/staff/confirmations" },
      { name: "Staff — Chat", description: "Concierge chat under /api/v1/staff/chat" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT access token. Use the **Bearer token bar** at the top of Swagger, or run `POST /api/v1/auth/sign-in` — token auto-fills.",
        },
      },
      parameters: {
        memberIdQueryRequired: {
          name: "memberId",
          in: "query",
          required: true,
          schema: { type: "integer", example: 1 },
          description: "Club member id (most module APIs use this instead of JWT)",
        },
        memberIdQueryOptional: {
          name: "memberId",
          in: "query",
          schema: { type: "integer", example: 1 },
        },
        vehicleIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
          description: "Vehicle id",
        },
        requestIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        bookingIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        sessionIdPath: {
          name: "sessionId",
          in: "path",
          required: true,
          schema: { type: "string", example: "cs_test_a1b2c3" },
        },
        inboxIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        eventIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        paymentMethodIdPath: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
        messagesMemberIdPath: {
          name: "memberId",
          in: "path",
          required: true,
          schema: { type: "integer", example: 1 },
        },
      },
      responses: {
        Success200: {
          description: "Success",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiSuccess" },
            },
          },
        },
        Success201: {
          description: "Created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiSuccess" },
            },
          },
        },
        Error400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        Error401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        Error404: {
          description: "Not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "object", nullable: true, additionalProperties: true },
            error: { nullable: true },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            data: { nullable: true },
            error: { type: "object", nullable: true },
            errors: { type: "array", items: { type: "object" } },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        HealthStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", example: "OK" },
          },
        },
        Member: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            roleId: { type: "integer", nullable: true, example: 1 },
            email: { type: "string", format: "email", example: "member@example.com" },
            name: { type: "string", nullable: true, example: "Alex Mitchell" },
            firstName: { type: "string", example: "Alex" },
            lastName: { type: "string", example: "Mitchell" },
            displayHandle: { type: "string", example: "@alexmitchell" },
            mobile: { type: "string" },
            residence: { type: "string" },
            profileImageUrl: { type: "string", example: "/uploads/avatars/photo.jpg" },
            coverImageUrl: { type: "string", example: "/uploads/covers/cover.jpg" },
            twoFactorEnabled: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MemberCreate: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string" },
            roleId: { type: "integer" },
          },
        },
        VehicleHealthItem: {
          type: "object",
          required: ["category", "percentage"],
          properties: {
            category: {
              type: "string",
              enum: [
                "engine_drivetrain",
                "tyres",
                "brakes",
                "fluids",
                "battery",
                "exterior_body",
              ],
            },
            percentage: { type: "integer", minimum: 0, maximum: 100, example: 85 },
            note: { type: "string", nullable: true },
          },
        },
        VehicleInfo: {
          type: "object",
          required: [
            "model",
            "year",
            "engine",
            "power",
            "transmission",
            "drive",
            "zeroToHundred",
            "topSpeed",
          ],
          properties: {
            name: { type: "string", example: "Lamborghini", description: "Brand / make" },
            make: { type: "string", example: "Lamborghini" },
            model: { type: "string", example: "Huracan STO" },
            year: { type: "integer", example: 2022 },
            engine: { type: "string", example: "5.2L Naturally Aspirated V10" },
            power: { type: "string", example: "640 hp, 565 Nm" },
            transmission: { type: "string", example: "7-speed LDF dual-clutch" },
            drive: { type: "string", example: "Rear-wheel drive" },
            zeroToHundred: { type: "string", example: "3.0 seconds" },
            topSpeed: { type: "string", example: "310 km/h" },
          },
        },
        VehicleOwnershipInfo: {
          type: "object",
          required: ["colour", "chassisNo", "plate", "purchasedAt", "storageBay", "mileage"],
          properties: {
            colour: { type: "string", example: "Nero Assoluto" },
            chassisNo: { type: "string", example: "ZHWEC2ZF0NLA14901" },
            plate: { type: "string", example: "Dubai - A 12345" },
            purchasedAt: { type: "string", format: "date", example: "2022-01-01" },
            storageBay: { type: "string", example: "Bay A-04, Level 1" },
            mileage: { type: "string", example: "12,450 km" },
          },
        },
        VehicleAdd: {
          type: "object",
          properties: {
            memberId: {
              type: "integer",
              example: 1,
              description: "Owner member id (required for wizard)",
            },
            vehicleInfo: { $ref: "#/components/schemas/VehicleInfo" },
            ownershipInfo: { $ref: "#/components/schemas/VehicleOwnershipInfo" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            documents: {
              type: "object",
              description: "Optional pre-uploaded document URLs",
              properties: {
                vehicleRegistration: { type: "string", format: "uri" },
                insuranceCertificate: { type: "string", format: "uri" },
                specsAndInfo: { type: "string", format: "uri" },
                serviceRecord: { type: "string", format: "uri" },
                purchasedInvoice: { type: "string", format: "uri" },
                warrantyCertificate: { type: "string", format: "uri" },
              },
            },
            status: { type: "string", example: "Available" },
            registrationStep: {
              type: "string",
              enum: ["vehicle_info", "ownership", "docs", "health", "complete"],
              default: "complete",
              description: "Which wizard step you are saving",
            },
            imageUrl: { type: "string", format: "uri" },
            isPriority: { type: "boolean" },
          },
        },
        VehicleAddPartial: {
          type: "object",
          properties: {
            memberId: { type: "integer", example: 1 },
            vehicleInfo: { $ref: "#/components/schemas/VehicleInfo" },
            ownershipInfo: { $ref: "#/components/schemas/VehicleOwnershipInfo" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            documents: { type: "object" },
            status: { type: "string" },
            registrationStep: {
              type: "string",
              enum: ["vehicle_info", "ownership", "docs", "health", "complete"],
            },
            submit: {
              type: "boolean",
              description: "Set true to finalize wizard (requires full health)",
            },
            imageUrl: { type: "string", format: "uri" },
            isPriority: { type: "boolean" },
          },
        },
        Vehicle: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            make: { type: "string", example: "Lamborghini" },
            model: { type: "string", example: "Huracan STO" },
            year: { type: "integer", example: 2022 },
            status: { type: "string", example: "Available" },
            engine: { type: "string" },
            power: { type: "string" },
            transmission: { type: "string" },
            drive: { type: "string" },
            zeroToHundred: { type: "string" },
            topSpeed: { type: "string" },
            colour: { type: "string" },
            chassisNo: { type: "string" },
            plate: { type: "string" },
            purchasedAt: { type: "string", format: "date" },
            storageBay: { type: "string" },
            mileage: { type: "string" },
            documents: { type: "object" },
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
            registrationStep: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        VehicleCreate: {
          type: "object",
          required: ["make", "model", "year"],
          properties: {
            make: { type: "string" },
            model: { type: "string" },
            year: { type: "integer", minimum: 1900, maximum: 2100 },
            status: { type: "string", default: "Available" },
          },
        },
        Request: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            status: {
              type: "string",
              example: "Requested",
              description: "Lifecycle status",
            },
            memberId: { type: "integer", example: 1 },
            vehicleId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RequestCreate: {
          type: "object",
          required: ["memberId", "vehicleId"],
          properties: {
            memberId: { type: "integer" },
            vehicleId: { type: "integer" },
            status: { type: "string", default: "Requested" },
          },
        },
        RequestStatusBody: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["Requested", "Accepted", "In Progress", "Completed"],
            },
          },
        },
        ModuleSuccessMembers: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Member" },
            },
          },
        },
        ModuleSuccessMember: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Member" },
          },
        },
        ModuleSuccessVehicles: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Vehicle" },
            },
          },
        },
        ModuleSuccessVehicle: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Vehicle" },
          },
        },
        ModuleSuccessRequests: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Request" },
            },
          },
        },
        ModuleSuccessRequest: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Request" },
          },
        },
        RequestLifecycleResult: {
          type: "object",
          properties: {
            id: { type: "string", description: "Request id from path" },
            status: { type: "string" },
          },
        },
        ModuleSuccessLifecycle: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/RequestLifecycleResult" },
          },
        },
        ConciergeMockItem: {
          type: "object",
          properties: {
            message: { type: "string", example: "Mock data for concierge" },
          },
        },
        ModuleSuccessConciergeList: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/ConciergeMockItem" },
            },
          },
        },
        ConciergeCreateResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Created concierge" },
            data: { type: "object", additionalProperties: true },
          },
        },
        ModuleSuccessConciergeCreate: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/ConciergeCreateResponse" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Server Error" },
          },
        },
        AuthTokensResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Signed in" },
            data: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                  description: "Paste this value into Swagger Authorize",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjF9.example",
                },
                refreshToken: { type: "string" },
                member: { $ref: "#/components/schemas/Member" },
                requires2fa: { type: "boolean", example: false },
                mfaToken: {
                  type: "string",
                  description: "Present when requires2fa is true; use with 2FA verify endpoint",
                },
              },
            },
            error: { nullable: true },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        OtpSendBody: {
          type: "object",
          required: ["purpose"],
          properties: {
            purpose: {
              type: "string",
              enum: ["login", "change_password", "enable_2fa"],
            },
            mfaToken: { type: "string", description: "Required when purpose is login" },
          },
        },
        OtpVerifyLoginBody: {
          type: "object",
          required: ["mfaToken", "code"],
          properties: {
            mfaToken: { type: "string" },
            code: { type: "string", pattern: "^\\d{6}$", example: "123456" },
          },
        },
        OtpVerifyEnableBody: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", pattern: "^\\d{6}$", example: "123456" },
          },
        },
        ChangePasswordBody: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
            otp: { type: "string", pattern: "^\\d{6}$", description: "Required when 2FA enabled" },
          },
        },
        ResetPasswordBody: {
          type: "object",
          required: ["email", "code", "newPassword"],
          properties: {
            email: { type: "string", format: "email" },
            code: { type: "string", pattern: "^\\d{6}$" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        PrivacySettingsPatch: {
          type: "object",
          properties: {
            biometricUnlockEnabled: { type: "boolean" },
            profileVisibility: {
              type: "string",
              enum: ["members_only", "public", "private"],
            },
            showAtClub: { type: "boolean" },
            eventsAttendanceVisibility: {
              type: "string",
              enum: ["members_only", "public", "private"],
            },
            vehicleVisibility: {
              type: "string",
              enum: ["members_only", "public", "private"],
            },
          },
        },
        GarageRequestCreate: {
          type: "object",
          required: ["memberId", "vehicleId"],
          properties: {
            memberId: { type: "integer", example: 1 },
            vehicleId: { type: "integer", example: 1 },
            type: {
              type: "string",
              enum: [
                "transport_delivery",
                "detailing_wash",
                "maintenance_service",
                "vehicle_source_assistance",
                "vehicle_booking",
              ],
            },
            serviceCategory: {
              type: "string",
              enum: [
                "maintenance_repair",
                "vehicle_source_assistance",
                "detailing_cleaning",
                "other_services",
              ],
            },
            title: { type: "string" },
            notes: { type: "string" },
            scheduledAt: { type: "string", format: "date-time" },
            status: { type: "string" },
          },
        },
        VehicleHealthPatch: {
          type: "object",
          required: ["health"],
          properties: {
            health: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleHealthItem" },
            },
          },
        },
        VehicleDocumentUpload: {
          type: "object",
          required: ["documentKey"],
          properties: {
            documentKey: {
              type: "string",
              enum: [
                "vehicleRegistration",
                "insuranceCertificate",
                "specsAndInfo",
                "serviceRecord",
                "purchasedInvoice",
                "warrantyCertificate",
              ],
            },
          },
        },
        VehiclePriorityPatch: {
          type: "object",
          required: ["isPriority"],
          properties: {
            isPriority: { type: "boolean" },
          },
        },
        MaintenanceRequestBody: {
          type: "object",
          required: ["memberId", "vehicleId", "serviceKeys", "scheduledAt", "locationKey"],
          properties: {
            memberId: { type: "integer", example: 1 },
            vehicleId: { type: "integer", example: 1 },
            serviceKeys: {
              type: "array",
              items: { type: "string" },
              example: ["scheduled_service"],
            },
            scheduledAt: { type: "string", format: "date-time" },
            locationKey: { type: "string", example: "workshop_main" },
            notes: { type: "string" },
            documentUrls: { type: "array", items: { type: "string", format: "uri" } },
          },
        },
        DetailingBookingBody: {
          type: "object",
          required: ["memberId", "vehicleId", "packageKey", "preferredDate"],
          properties: {
            memberId: { type: "integer", example: 1 },
            vehicleId: { type: "integer", example: 2 },
            packageKey: {
              type: "string",
              enum: [
                "full_detail",
                "interior_only",
                "exterior_wash",
                "exterior_only",
              ],
              example: "full_detail",
              description: "FULL DETAIL | INTERIOR ONLY | EXTERIOR ONLY",
            },
            addonKeys: {
              type: "array",
              items: { type: "string" },
              example: ["ceramic_coat"],
            },
            preferredDate: {
              type: "string",
              format: "date",
              example: "2025-04-30",
            },
            scheduledDate: {
              type: "string",
              format: "date",
              description: "Alias for preferredDate",
            },
            timeWindowStart: { type: "string", example: "10:00" },
            timeWindowEnd: { type: "string", example: "14:00" },
            timeWindow: { type: "string", example: "10:00 - 14:00" },
            locationKey: {
              type: "string",
              example: "workshop_main",
              description: "Sheikh Zayed Road workshop",
            },
            serviceLocation: {
              type: "string",
              example: "Sheikh Zayed Road",
              description: "Custom location if locationKey omitted",
            },
            specialInstructions: {
              type: "string",
              example: "Please use covered parking entrance.",
            },
            notes: { type: "string", description: "Alias for specialInstructions" },
          },
        },
        SourcingRequestBody: {
          type: "object",
          required: ["memberId", "make", "model"],
          properties: {
            memberId: { type: "integer", example: 1 },
            make: { type: "string", example: "Ferrari" },
            model: { type: "string", example: "SF90" },
            yearMin: { type: "integer" },
            yearMax: { type: "integer" },
            colour: { type: "string" },
            trim: { type: "string" },
            specifications: { type: "object" },
            budgetMin: { type: "integer" },
            budgetMax: { type: "integer" },
            currency: { type: "string", default: "AED" },
            timelineNotes: { type: "string" },
            notes: { type: "string" },
          },
        },
        TransportRequestBody: {
          type: "object",
          required: ["memberId", "vehicleId", "serviceType", "preferredDate"],
          properties: {
            memberId: {
              oneOf: [{ type: "integer", example: 1 }, { type: "string", example: "0000002" }],
              description: "Member id or member number (00004, 0000002, …)",
            },
            vehicleId: { type: "integer", example: 2 },
            serviceType: {
              type: "string",
              enum: [
                "pickup_from_storage",
                "return_to_storage",
                "custom_transfer",
                "transport_delivery",
              ],
              example: "pickup_from_storage",
              description:
                "Pickup from storage | Return to storage | Custom transfer | Transport delivery",
            },

            requestType: {
              type: "string",
              description: "Alias for serviceType",
            },
            deliveryAddress: {
              type: "string",
              example: "Dubai Marina, Tower 3",
              description: "Required for pickup_from_storage (destination)",
            },
            pickupAddress: {
              type: "string",
              description: "Your location — required for return_to_storage",
            },
            dropoffAddress: {
              type: "string",
              description: "Required for custom_transfer (destination)",
            },
            preferredDate: {
              type: "string",
              format: "date",
              example: "2025-05-01",
            },
            scheduledDate: {
              type: "string",
              format: "date",
              description: "Alias for preferredDate",
            },
            timeWindowStart: { type: "string", example: "10:00" },
            timeWindowEnd: { type: "string", example: "12:00" },
            timeWindow: {
              type: "string",
              example: "10:00 - 12:00",
              description: "Alternative to timeWindowStart/timeWindowEnd",
            },
            notes: {
              type: "string",
              example: "Please warm up the car before arrival.",
            },
            storageLocation: {
              type: "string",
              description: "Optional Toy-Box storage address override",
            },
            pickupLocation: {
              type: "string",
              description: "Legacy — used with dropoffLocation + scheduledAt",
            },
            dropoffLocation: { type: "string" },
            scheduledAt: { type: "string", format: "date-time" },
          },
        },
        MessageSendBody: {
          type: "object",
          required: ["memberId", "body"],
          properties: {
            memberId: { type: "integer", example: 1 },
            body: { type: "string", example: "Hello concierge" },
          },
        },
        PaymentMethodCreate: {
          type: "object",
          required: ["memberId", "label"],
          properties: {
            memberId: { type: "integer", example: 1 },
            label: { type: "string", example: "Visa" },
            brand: { type: "string", example: "visa" },
            last4: { type: "string", example: "4242" },
            expiryMonth: { type: "integer", example: 12 },
            expiryYear: { type: "integer", example: 2028 },
            isDefault: { type: "boolean" },
          },
        },
        StripeCheckoutBody: {
          type: "object",
          required: ["memberId", "purpose"],
          properties: {
            memberId: { type: "integer", example: 1 },
            purpose: { type: "string", enum: ["maintenance", "detailing", "generic"] },
            referenceId: { type: "integer" },
            amountAed: { type: "integer" },
            description: { type: "string" },
            successUrl: { type: "string", format: "uri" },
            cancelUrl: { type: "string", format: "uri" },
          },
        },
        NotificationSettingsPatch: {
          type: "object",
          properties: {
            preferences: {
              type: "object",
              properties: {
                pushEnabled: { type: "boolean" },
                emailEnabled: { type: "boolean" },
                emailDigestTime: { type: "string", example: "09:00" },
                smsEnabled: { type: "boolean" },
              },
            },
            fromTheClub: { type: "object" },
            quietHours: { type: "object" },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "swagger", "member.module.doc.js"),
    path.join(__dirname, "swagger", "admin.module.doc.js"),
    path.join(__dirname, "swagger", "staff.module.doc.js"),
  ],
};

function applyTagGroups(openApiSpec) {
  openApiSpec["x-tagGroups"] = [
    {
      name: "Member",
      tags: [
        "Member — Auth",
        "Member — Profile",
        "Member — Events",
        "Member — Vehicles",
        "Member — Sourcing",
        "Member — Chat",
        "Member — Transport",
        "Member — Detailing",
        "Member — Maintenance",
        "Member — Notifications",
      ],
    },
    {
      name: "Admin",
      tags: [
        "Admin — Auth",
        "Admin — Members",
        "Admin — Staff",
        "Admin — Inventory",
        "Admin — Vehicles",
        "Admin — Sourcing",
        "Admin — Chat",
      ],
    },
    {
      name: "Staff",
      tags: [
        "Staff — Auth",
        "Staff — Overview",
        "Staff — Profile",
        "Staff — Inventory",
        "Staff — Vehicles",
        "Staff — Sourcing",
        "Staff — Confirmations",
        "Staff — Chat",
      ],
    },
  ];
  return openApiSpec;
}

const specs = applyTagGroups(normalizeOpenApiPaths(swaggerJsdoc(options)));

const swaggerUiExtrasCss = fs.readFileSync(
  path.join(__dirname, "swagger", "swaggerUi.extras.css"),
  "utf8",
);
const swaggerUiExtrasJs = fs.readFileSync(
  path.join(__dirname, "swagger", "swaggerUi.extras.js"),
  "utf8",
);

function buildSwaggerUiOptions({ inline = false } = {}) {
  const swaggerOptions = {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    tryItOutEnabled: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
    requestInterceptor: swaggerRequestInterceptor,
    responseInterceptor: swaggerResponseInterceptor,
  };

  // Inline spec avoids a separate fetch to /api-docs/openapi.json (fixes "Failed to fetch").
  if (!inline) {
    swaggerOptions.url = "/api-docs/openapi.json";
  }

  return {
    swaggerOptions,
    customSiteTitle: "Toybox API Docs",
    customCss: swaggerUiExtrasCss,
    customJsStr: swaggerUiExtrasJs,
  };
}

function resolveRequestBaseUrl(req) {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = forwarded ? String(forwarded).split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  if (!host) return LOCAL_URL;
  return `${proto}://${host}`.replace(/\/$/, "");
}

/** Merge duplicate path entries (e.g. shared member/staff routes) instead of dropping them. */
function mergePathOperations(existing = {}, incoming = {}) {
  const merged = { ...existing };
  for (const [method, operation] of Object.entries(incoming)) {
    if (!merged[method]) {
      merged[method] = operation;
      continue;
    }
    const existingTags = merged[method].tags || [];
    const incomingTags = operation.tags || [];
    merged[method] = {
      ...merged[method],
      ...operation,
      tags: [...new Set([...existingTags, ...incomingTags])],
    };
  }
  return merged;
}

/** Keep only `/api/v1/*` paths in OpenAPI (drop unversioned legacy `/api/*` entries). */
function normalizeOpenApiPaths(openApiSpec) {
  if (!openApiSpec.paths) return openApiSpec;

  const paths = {};

  for (const [path, operations] of Object.entries(openApiSpec.paths)) {
    let targetPath = path;

    if (path.startsWith("/api/") && !path.startsWith("/api/v1/")) {
      targetPath = `/api/v1${path.slice(4)}`;
    }

    if (targetPath.startsWith("/api/") && !targetPath.startsWith("/api/v1/")) {
      continue;
    }

    if (paths[targetPath]) {
      paths[targetPath] = mergePathOperations(paths[targetPath], operations);
    } else {
      paths[targetPath] = operations;
    }
  }

  openApiSpec.paths = paths;
  return openApiSpec;
}

function ensureSpecTags(openApiSpec) {
  const tagMap = new Map((openApiSpec.tags || []).map((tag) => [tag.name, tag]));
  for (const operations of Object.values(openApiSpec.paths || {})) {
    for (const operation of Object.values(operations || {})) {
      for (const tagName of operation.tags || []) {
        if (!tagMap.has(tagName)) {
          tagMap.set(tagName, { name: tagName });
        }
      }
    }
  }
  openApiSpec.tags = [...tagMap.values()].sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  );
  return openApiSpec;
}

function buildSpecsForRequest(req) {
  const dynamic = typeof structuredClone === "function"
    ? structuredClone(specs)
    : JSON.parse(JSON.stringify(specs));
  dynamic.servers = buildServersList(req);
  normalizeOpenApiPaths(dynamic);
  applyTagGroups(dynamic);
  ensureSpecTags(dynamic);
  return dynamic;
}

module.exports = {
  swaggerUi,
  specs,
  buildSwaggerUiOptions,
  buildSpecsForRequest,
  resolveRequestBaseUrl,
};
