"use strict";

const AppError = require("../../../utils/AppError");
const { uploadVehicleDocument } = require("../../../services/storage.service");
const inventoryRepository = require("./inventory.repository");
const assignmentRepository = require("../../sourcing/sourcingAssignment.repository");
const {
  buildVehiclePayload,
  mergeDocuments,
  DOCUMENT_TYPES,
} = require("../../rides/rides.mapper");
const { assertWizardHealth, assertReadyForComplete } = require("../../rides/rides.wizard");
const { formatVehicleWizard } = require("../../rides/rides.formatter");

async function assertUniqueChassis(chassisNo, excludeId = null) {
  if (!chassisNo) return;
  const { Vehicle } = require("../../../models");
  const existing = await Vehicle.findOne({ where: { chassisNo } });
  if (existing && existing.id !== excludeId) {
    throw new AppError("Chassis number already exists", 409);
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

async function uploadFilesFromMultipart(filesByField = {}) {
  const uploads = {};
  for (const docType of DOCUMENT_TYPES) {
    const file = filesByField[docType]?.[0];
    if (!file) continue;
    const { url } = await uploadVehicleDocument({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalName: file.originalname,
    });
    uploads[docType] = url;
  }
  return uploads;
}

async function buildInventoryCreatePayload(body, filesByField = {}) {
  assertWizardHealth(body.health);

  const payload = buildVehiclePayload(body, {
    registrationStep: "complete",
    status: body.status || "Stored",
  });

  if (!payload.make) {
    throw new AppError("vehicleInfo with name or make is required", 400);
  }
  if (!payload.chassisNo) {
    throw new AppError("ownershipInfo is required", 400);
  }

  await assertUniqueChassis(payload.chassisNo);

  const vehicleImage = filesByField.vehicleImage?.[0];
  if (vehicleImage) {
    const { url } = await uploadVehicleDocument({
      buffer: vehicleImage.buffer,
      mimetype: vehicleImage.mimetype,
      originalName: vehicleImage.originalname,
    });
    payload.imageUrl = url;
  } else if (body.imageUrl) {
    payload.imageUrl = body.imageUrl;
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
  payload.ownershipType = "inventory";
  payload.memberId = null;
  payload.isPriority = body.isPriority ?? false;

  return payload;
}

exports.getWizardSchema = () => {
  const ridesService = require("../../rides/rides.service");
  const schema = ridesService.getWizardSchema();
  if (schema.submitApi?.step1_vehicleInfo) {
    delete schema.submitApi.step1_vehicleInfo.memberId;
  }
  schema.submitApi.documentUploadFields = [
    "vehicleRegistration",
    "insuranceCertificate",
    "specsAndInfo",
    "serviceRecord",
    "purchasedInvoice",
    "warrantyCertificate",
    "vehicleImage",
  ];
  return schema;
};

exports.create = async (body, filesByField = {}) => {
  const payload = await buildInventoryCreatePayload(body, filesByField);
  const row = await inventoryRepository.create(payload);
  assertReadyForComplete(row);
  return formatVehicleWizard(row);
};

exports.list = async (query) => {
  const [summary, total, rows] = await Promise.all([
    inventoryRepository.countSummary(query),
    inventoryRepository.count(query),
    inventoryRepository.findAll(query),
  ]);
  return {
    summary,
    vehicles: rows.map(formatVehicleWizard),
    total,
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  };
};

exports.getById = async (id) => {
  const row = await inventoryRepository.findByPk(id);
  if (!row) throw new AppError("Inventory vehicle not found", 404);
  return formatVehicleWizard(row);
};

exports.update = async (id, body, filesByField = {}) => {
  const row = await inventoryRepository.findByPk(id);
  if (!row) throw new AppError("Inventory vehicle not found", 404);

  const patch = {};

  if (body.vehicleInfo) {
    Object.assign(patch, buildVehiclePayload({ vehicleInfo: body.vehicleInfo }));
  }
  if (body.ownershipInfo) {
    Object.assign(patch, buildVehiclePayload({ ownershipInfo: body.ownershipInfo }));
    if (patch.chassisNo && patch.chassisNo !== row.chassisNo) {
      await assertUniqueChassis(patch.chassisNo, id);
    }
  }
  if (body.health) {
    assertWizardHealth(body.health);
    patch.health = body.health;
  }
  if (body.documents) {
    patch.documents = mergeDocuments(row.documents || {}, body.documents);
  }

  const scalarFields = [
    "status",
    "isPriority",
    "imageUrl",
    "lastServicedAt",
    "vehicleType",
    "fuelType",
    "fuelLevel",
    "interiorColor",
    "fuelEfficiency",
    "maxTorque",
  ];
  for (const key of scalarFields) {
    if (body[key] !== undefined) patch[key] = body[key];
  }

  const vehicleImage = filesByField.vehicleImage?.[0];
  if (vehicleImage) {
    const { url } = await uploadVehicleDocument({
      buffer: vehicleImage.buffer,
      mimetype: vehicleImage.mimetype,
      originalName: vehicleImage.originalname,
    });
    patch.imageUrl = url;
  }

  const fileUploads = await uploadFilesFromMultipart(filesByField);
  if (Object.keys(fileUploads).length) {
    patch.documents = mergeDocuments(
      patch.documents || row.documents || {},
      enrichDocumentUploads(fileUploads),
    );
  }

  if (!Object.keys(patch).length) {
    throw new AppError("No valid fields to update", 400);
  }

  const updated = await inventoryRepository.update(id, patch);
  return formatVehicleWizard(updated);
};

exports.remove = async (id) => {
  if (await assignmentRepository.isVehicleAssignedPending(id)) {
    throw new AppError("Cannot delete — vehicle has a pending sourcing assignment", 400);
  }
  const ok = await inventoryRepository.destroy(id);
  if (!ok) throw new AppError("Inventory vehicle not found", 404);
  return { id: Number(id), deleted: true };
};
