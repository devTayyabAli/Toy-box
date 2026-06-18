const { Vehicle } = require("../../models");

function mapVehicleInfo(vehicleInfo) {
  if (!vehicleInfo) {
    return {};
  }
  const name = vehicleInfo.name ?? vehicleInfo.make;
  return {
    make: name,
    model: vehicleInfo.model,
    year: vehicleInfo.year,
    engine: vehicleInfo.engine,
    power: vehicleInfo.power,
    maxTorque: vehicleInfo.maxTorque,
    transmission: vehicleInfo.transmission,
    drive: vehicleInfo.drive,
    zeroToHundred: vehicleInfo.zeroToHundred,
    topSpeed: vehicleInfo.topSpeed,
    fuelType: vehicleInfo.fuelType,
    fuelEfficiency: vehicleInfo.fuelEfficiency,
    interiorColor: vehicleInfo.interiorColor,
    vehicleType: vehicleInfo.vehicleType,
    fuelLevel: vehicleInfo.fuelLevel,
  };
}

function mapOwnershipInfo(ownershipInfo) {
  if (!ownershipInfo) {
    return {};
  }
  return {
    colour: ownershipInfo.colour,
    chassisNo: ownershipInfo.chassisNo,
    plate: ownershipInfo.plate,
    purchasedAt: ownershipInfo.purchasedAt,
    storageBay: ownershipInfo.storageBay,
    mileage: ownershipInfo.mileage,
  };
}

function buildVehiclePayload(body, options = {}) {
  const { registrationStep = "complete", status = "Available" } = options;
  const payload = {
    ...mapVehicleInfo(body.vehicleInfo),
    ...mapOwnershipInfo(body.ownershipInfo),
    status: body.status ?? status,
    registrationStep: body.registrationStep ?? registrationStep,
  };

  if (body.health) {
    payload.health = body.health;
  }
  if (body.documents) {
    payload.documents = body.documents;
  }
  if (body.memberId !== undefined) {
    payload.memberId = body.memberId;
  }
  if (body.isPriority !== undefined) {
    payload.isPriority = body.isPriority;
  }
  if (body.imageUrl !== undefined) {
    payload.imageUrl = body.imageUrl;
  }
  if (body.lastServicedAt !== undefined) {
    payload.lastServicedAt = body.lastServicedAt;
  }
  if (body.ownerName !== undefined) {
    payload.ownerName = body.ownerName;
  }
  if (body.vehicleType !== undefined) {
    payload.vehicleType = body.vehicleType;
  }
  if (body.fuelType !== undefined) {
    payload.fuelType = body.fuelType;
  }
  if (body.fuelLevel !== undefined) {
    payload.fuelLevel = body.fuelLevel;
  }
  if (body.interiorColor !== undefined) {
    payload.interiorColor = body.interiorColor;
  }
  if (body.fuelEfficiency !== undefined) {
    payload.fuelEfficiency = body.fuelEfficiency;
  }
  if (body.maxTorque !== undefined) {
    payload.maxTorque = body.maxTorque;
  }

  return payload;
}

function mergeDocuments(existing = {}, updates = {}) {
  return { ...existing, ...updates };
}

module.exports = {
  mapVehicleInfo,
  mapOwnershipInfo,
  buildVehiclePayload,
  mergeDocuments,
  DOCUMENT_TYPES: Vehicle.DOCUMENT_TYPES,
  HEALTH_CATEGORIES: Vehicle.HEALTH_CATEGORIES,
};
