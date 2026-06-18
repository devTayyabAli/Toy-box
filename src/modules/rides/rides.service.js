const AppError = require("../../utils/AppError");
const { uploadVehicleDocument } = require("../../services/storage.service");
const ridesRepository = require("./rides.repository");
const {
  buildVehiclePayload,
  mergeDocuments,
  DOCUMENT_TYPES,
} = require("./rides.mapper");
const { formatVehicleWizard } = require("./rides.formatter");
const { assertReadyForComplete, assertWizardHealth } = require("./rides.wizard");
const { WIZARD_HEALTH_KEYS } = require("./rides.constants");
const { resolveMemberRef } = require("../../utils/resolveMemberRef");

async function assertUniqueChassis(chassisNo, excludeId = null) {
  if (!chassisNo) return;
  const { Vehicle } = require("../../models");
  const existing = await Vehicle.findOne({ where: { chassisNo } });
  if (existing && existing.id !== excludeId) {
    throw new AppError("Chassis number already registered", 409);
  }
}

function enrichDocumentUploads(uploads) {
  const now = new Date().toISOString();
  const enriched = {};
  for (const [key, url] of Object.entries(uploads)) {
    enriched[key] = { url, uploadedAt: now };
  }
  return enriched;
}

async function uploadFilesFromMultipart(filesByField) {
  const uploads = {};
  for (const docType of DOCUMENT_TYPES) {
    const file = filesByField[docType]?.[0];
    if (!file) {
      continue;
    }
    const { url } = await uploadVehicleDocument({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalName: file.originalname,
    });
    uploads[docType] = url;
  }
  return uploads;
}

exports.getWizardSchema = () => {
  const { WIZARD_STEPS, WIZARD_HEALTH_CATEGORIES, DOCUMENT_FIELDS } = require("./rides.constants");
  return {
    steps: WIZARD_STEPS,
    healthCategories: WIZARD_HEALTH_CATEGORIES,
    documentFields: DOCUMENT_FIELDS,
    healthKeys: WIZARD_HEALTH_KEYS,
    submitApi: {
      method: "POST",
      path: "/api/v1/admin/vehicles/inventory",
      contentType: "multipart/form-data",
      adminOnly: true,
      description:
        "Admin only. One multipart request with all wizard fields. Members use sourcing flow instead of POST /api/v1/vehicles.",
      deprecatedEndpoints: [
        "POST /api/v1/vehicles/{id}/documents",
        "POST /api/v1/vehicles/{id}/documents/upload",
      ],
      step1_vehicleInfo: {
        make: "Lamborghini",
        model: "Huracan STO",
        year: 2022,
        engine: "5.2L V10",
        power: "640 hp",
        transmission: "7-speed dual-clutch",
        drive: "Rear-wheel drive",
        zeroToHundred: "3.0 seconds",
        topSpeed: "310 km/h",
        vehicleType: "car",
      },
      step2_ownership: {
        colour: "Nero Assoluto",
        chassisNo: "ZHWEC2ZF0NLA14901",
        plate: "Dubai - A 12345",
        purchasedAt: "2022-01-01",
        storageBay: "Bay A-04",
        mileage: "12,450 km",
      },
      step3_documents: DOCUMENT_FIELDS,
      documentFileFields: DOCUMENT_FIELDS.map((d) => ({
        field: d.key,
        label: d.label,
        type: "file",
        maxCount: 1,
      })),
      step4_health: {
        health_engine_drivetrain: 85,
        health_tyres: 90,
        health_brakes: 88,
        health_fluids: 82,
        health_battery: 78,
        health_exterior_body: 91,
        health_engine_drivetrain_note: "optional note",
      },
      optionalFileFields: ["vehicleImage"],
    },
  };
};

exports.list = async () => {
  const rows = await ridesRepository.findAll();
  return rows.map(formatVehicleWizard);
};

exports.getById = async (id) => {
  const vehicle = await ridesRepository.findById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return formatVehicleWizard(vehicle);
};

exports.createWithDocuments = async (body, filesByField = {}) => {
  assertWizardHealth(body.health);

  const member = await resolveMemberRef(body.memberId);
  const payload = buildVehiclePayload(
    { ...body, memberId: member.id },
    { registrationStep: "complete" },
  );

  if (!payload.make) {
    throw new AppError("vehicleInfo with name or make is required", 400);
  }
  if (!payload.chassisNo) {
    throw new AppError("ownershipInfo is required", 400);
  }

  if (payload.chassisNo) {
    await assertUniqueChassis(payload.chassisNo);
  }

  const vehicleImage = filesByField.vehicleImage?.[0];
  if (vehicleImage) {
    const { url } = await uploadVehicleDocument({
      buffer: vehicleImage.buffer,
      mimetype: vehicleImage.mimetype,
      originalName: vehicleImage.originalname,
    });
    payload.imageUrl = url;
  }

  const fileUploads = await uploadFilesFromMultipart(filesByField);
  let documents = body.documents ? mergeDocuments({}, body.documents) : {};
  if (Object.keys(fileUploads).length) {
    documents = mergeDocuments(documents, enrichDocumentUploads(fileUploads));
  }
  if (Object.keys(documents).length) {
    payload.documents = documents;
  }

  payload.registrationStep = "complete";
  payload.status = payload.status || "Available";

  const vehicle = await ridesRepository.create(payload);

  assertReadyForComplete(vehicle);
  return formatVehicleWizard(vehicle);
};

exports.create = async (body) => {
  let registrationStep = body.registrationStep;
  if (!registrationStep) {
    if (body.health?.length) {
      registrationStep = "complete";
    } else if (body.ownershipInfo && body.vehicleInfo) {
      registrationStep = "docs";
    } else if (body.ownershipInfo) {
      registrationStep = "ownership";
    } else if (body.vehicleInfo) {
      registrationStep = "vehicle_info";
    } else {
      registrationStep = "vehicle_info";
    }
  }

  const payload = buildVehiclePayload(body, { registrationStep });

  if (registrationStep === "complete" || body.health?.length) {
    if (!payload.make) {
      throw new AppError("vehicleInfo with name or make is required", 400);
    }
    if (!payload.chassisNo) {
      throw new AppError("ownershipInfo is required", 400);
    }
    assertWizardHealth(body.health || payload.health);
    payload.registrationStep = "complete";
  }

  if (payload.chassisNo) {
    await assertUniqueChassis(payload.chassisNo);
  }

  const vehicle = await ridesRepository.create(payload);

  if (payload.registrationStep === "complete") {
    assertReadyForComplete(vehicle);
  }

  return formatVehicleWizard(vehicle);
};

exports.update = async (id, body) => {
  const existing = await ridesRepository.findById(id);
  if (!existing) {
    throw new AppError("Vehicle not found", 404);
  }

  const patch = {};

  if (body.vehicleInfo) {
    Object.assign(patch, buildVehiclePayload({ vehicleInfo: body.vehicleInfo }));
  }
  if (body.ownershipInfo) {
    Object.assign(patch, buildVehiclePayload({ ownershipInfo: body.ownershipInfo }));
  }
  if (body.health) {
    patch.health = body.health;
  }
  if (body.documents) {
    patch.documents = mergeDocuments(existing.documents || {}, body.documents);
  }
  if (body.status) {
    patch.status = body.status;
  }
  if (body.memberId !== undefined) {
    patch.memberId = body.memberId;
  }
  if (body.isPriority !== undefined) {
    patch.isPriority = body.isPriority;
  }
  if (body.imageUrl !== undefined) {
    patch.imageUrl = body.imageUrl;
  }

  if (patch.chassisNo) {
    await assertUniqueChassis(patch.chassisNo, Number(id));
  }

  if (body.registrationStep) {
    patch.registrationStep = body.registrationStep;
  } else if (body.health?.length && body.submit === true) {
    assertWizardHealth(body.health);
    patch.registrationStep = "complete";
  } else if (body.health?.length) {
    patch.registrationStep = "health";
  } else if (body.ownershipInfo) {
    patch.registrationStep = "docs";
  } else if (body.vehicleInfo) {
    patch.registrationStep = "ownership";
  }

  if (patch.registrationStep === "complete") {
    const merged = { ...existing.get({ plain: true }), ...patch };
    assertReadyForComplete(merged);
  }

  const vehicle = await ridesRepository.updateById(id, patch);
  return formatVehicleWizard(vehicle);
};

exports.remove = async (id) => {
  const vehicle = await ridesRepository.deleteById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return { id: vehicle.id, deleted: true };
};

exports.uploadDocuments = async (id, filesByField, { advanceStep = true } = {}) => {
  const vehicle = await ridesRepository.findById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const uploads = await uploadFilesFromMultipart(filesByField);

  if (!Object.keys(uploads).length) {
    throw new AppError(
      "At least one document file is required. Allowed fields: " + DOCUMENT_TYPES.join(", "),
      400,
    );
  }

  const documents = mergeDocuments(vehicle.documents || {}, enrichDocumentUploads(uploads));

  const patch = {
    documents,
    registrationStep: vehicle.registrationStep === "complete" ? "complete" : "docs",
  };
  if (advanceStep) {
    patch.registrationStep = "health";
  }

  const updated = await ridesRepository.updateById(id, patch);
  return formatVehicleWizard(updated);
};
