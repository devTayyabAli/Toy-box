const Response = require("../../helpers/response.helper");
const { WIZARD_HEALTH_KEYS } = require("./rides.constants");

const JSON_FIELD_NAMES = ["vehicleInfo", "ownershipInfo", "health", "documents"];

const VEHICLE_INFO_FIELDS = [
  "make",
  "name",
  "model",
  "year",
  "engine",
  "power",
  "transmission",
  "drive",
  "zeroToHundred",
  "topSpeed",
  "vehicleType",
  "fuelType",
  "fuelEfficiency",
  "maxTorque",
  "interiorColor",
  "fuelLevel",
];

const OWNERSHIP_FIELDS = [
  "colour",
  "chassisNo",
  "plate",
  "purchasedAt",
  "storageBay",
  "mileage",
];

function parseJsonField(value, fieldName) {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} must be valid JSON`);
  }
}

function pickFlatVehicleInfo(body) {
  const info = {};
  for (const key of VEHICLE_INFO_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") {
      info[key] = key === "year" ? Number(body[key]) : String(body[key]).trim();
    }
  }
  return Object.keys(info).length ? info : undefined;
}

function pickFlatOwnership(body) {
  const info = {};
  for (const key of OWNERSHIP_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") {
      info[key] = String(body[key]).trim();
    }
  }
  return Object.keys(info).length ? info : undefined;
}

function pickFlatHealth(body) {
  const items = [];
  for (const category of WIZARD_HEALTH_KEYS) {
    const pctKey = `health_${category}`;
    const noteKey = `health_${category}_note`;
    if (body[pctKey] !== undefined && body[pctKey] !== "") {
      items.push({
        category,
        percentage: Number(body[pctKey]),
        note: body[noteKey] ? String(body[noteKey]).trim() : null,
      });
    }
  }
  return items.length ? items : undefined;
}

function buildBodyFromMultipart(raw) {
  const rawPayload = raw.payload ?? raw.data;
  if (rawPayload != null && rawPayload !== "") {
    return parseJsonField(rawPayload, "payload");
  }

  const vehicleInfo =
    parseJsonField(raw.vehicleInfo, "vehicleInfo") || pickFlatVehicleInfo(raw);
  const ownershipInfo =
    parseJsonField(raw.ownershipInfo, "ownershipInfo") || pickFlatOwnership(raw);
  const health = parseJsonField(raw.health, "health") || pickFlatHealth(raw);

  const body = {
    memberId:
      raw.memberId !== undefined && raw.memberId !== ""
        ? String(raw.memberId).trim()
        : undefined,
    vehicleInfo,
    ownershipInfo,
    health,
    status: raw.status || undefined,
    isPriority:
      raw.isPriority !== undefined && raw.isPriority !== ""
        ? raw.isPriority === "true" || raw.isPriority === true
        : undefined,
  };

  if (raw.documents) {
    body.documents = parseJsonField(raw.documents, "documents");
  }

  const { DOCUMENT_TYPES } = require("./rides.mapper");
  const docUrls = {};
  for (const key of DOCUMENT_TYPES) {
    const val = raw[key];
    if (typeof val === "string" && val.trim() && /^https?:\/\//i.test(val.trim())) {
      docUrls[key] = val.trim();
    }
  }
  if (Object.keys(docUrls).length) {
    body.documents = { ...(body.documents || {}), ...docUrls };
  }

  return body;
}

function parseAddVehicleMultipart(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  req.isAddVehicleMultipart = contentType.includes("multipart/form-data");

  if (!req.isAddVehicleMultipart) {
    return next();
  }

  try {
    req.body = buildBodyFromMultipart(req.body);

    if (!req.body.memberId) {
      throw new Error("memberId is required");
    }
    if (!req.body.vehicleInfo) {
      throw new Error(
        "Step 1 — provide make, model, year, engine, power, transmission, drive, zeroToHundred, topSpeed (or vehicleInfo JSON)",
      );
    }
    if (!req.body.ownershipInfo) {
      throw new Error(
        "Step 2 — provide colour, chassisNo, plate, purchasedAt, storageBay, mileage (or ownershipInfo JSON)",
      );
    }
    if (!req.body.health?.length) {
      throw new Error(
        "Step 4 — provide health_* fields (e.g. health_engine_drivetrain=85) or health JSON array",
      );
    }

    req.body.registrationStep = "complete";
    return next();
  } catch (err) {
    return Response.validationError(res, "Invalid Add Vehicle form", [
      { field: "form", message: err.message },
    ]);
  }
}

module.exports = {
  parseAddVehicleMultipart,
  buildBodyFromMultipart,
  VEHICLE_INFO_FIELDS,
  OWNERSHIP_FIELDS,
};
