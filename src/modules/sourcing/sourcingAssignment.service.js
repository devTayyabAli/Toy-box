"use strict";

const AppError = require("../../utils/AppError");
const { Vehicle, SourcingRequest, Member } = require("../../models");
const assignmentRepository = require("./sourcingAssignment.repository");
const sourcingRepository = require("./sourcing.repository");
const { notifyMember } = require("../notifications/notifications.dispatch");

function mapInventoryVehicle(v) {
  const row = v.get ? v.get({ plain: true }) : v;
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    colour: row.colour,
    status: row.status,
    chassisNo: row.chassisNo,
    plate: row.plate,
    imageUrl: row.imageUrl,
    ownershipType: row.ownershipType,
    storageBay: row.storageBay,
  };
}

function mapMember(member) {
  if (!member) return null;
  const row = member.get ? member.get({ plain: true }) : member;
  return {
    id: row.id,
    name: row.name || [row.firstName, row.lastName].filter(Boolean).join(" ") || null,
    email: row.email || null,
  };
}

function mapAssignment(a, member) {
  const plain = a.get ? a.get({ plain: true }) : a;
  const memberRow = member || plain.member || plain.offeredToMember || null;
  return {
    id: plain.id,
    sourcingRequestId: plain.sourcingRequestId,
    vehicleId: plain.vehicleId,
    memberId: plain.memberId || memberRow?.id || null,
    status: plain.status,
    assignedAt: plain.assignedAt,
    memberDecidedAt: plain.memberDecidedAt,
    rejectionReason: plain.rejectionReason,
    adminNotes: plain.adminNotes,
    offerStartDate: plain.offerStartDate || null,
    offerEndDate: plain.offerEndDate || null,
    preferredDates:
      plain.offerStartDate || plain.offerEndDate
        ? { start: plain.offerStartDate || null, end: plain.offerEndDate || null }
        : null,
    vehicle: plain.vehicle ? mapInventoryVehicle(plain.vehicle) : null,
    member: mapMember(memberRow),
  };
}

function normalizeOfferDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function loadRequest(id) {
  const row = await sourcingRepository.findById(id);
  if (!row) throw new AppError("Sourcing request not found", 404);
  return row;
}

exports.assignVehicleToRequest = async (
  sourcingRequestId,
  vehicleId,
  adminMemberId,
  options = {},
) => {
  const adminNotes = typeof options === "string" ? options : options.adminNotes;
  const offerStartDate = normalizeOfferDate(
    options.offerStartDate || options.startDate,
  );
  const offerEndDate = normalizeOfferDate(options.offerEndDate || options.endDate);
  const targetMemberId = Number(options.memberId);

  if (!targetMemberId) {
    throw new AppError("memberId is required", 400);
  }
  if (!offerStartDate || !offerEndDate) {
    throw new AppError("offerStartDate and offerEndDate are required", 400);
  }
  if (offerEndDate < offerStartDate) {
    throw new AppError("offerEndDate must be on or after offerStartDate", 400);
  }

  const request = await loadRequest(sourcingRequestId);
  if (["Completed", "Cancelled"].includes(request.status)) {
    throw new AppError("Cannot assign vehicle to a closed request", 400);
  }
  if (Number(request.memberId) !== targetMemberId) {
    throw new AppError("memberId does not match the sourcing request member", 400);
  }

  const member = await Member.findByPk(targetMemberId);
  if (!member) throw new AppError("Member not found", 404);

  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.ownershipType !== "inventory") {
    throw new AppError("Vehicle is not in admin inventory", 400);
  }

  const pending = await assignmentRepository.findPendingForRequest(sourcingRequestId);
  if (pending) {
    throw new AppError("A vehicle is already pending member approval for this request", 409);
  }

  await assignmentRepository.withdrawPendingForRequest(sourcingRequestId);

  const assignment = await assignmentRepository.create({
    sourcingRequestId,
    vehicleId,
    status: "pending_member_approval",
    assignedByMemberId: adminMemberId,
    assignedAt: new Date(),
    adminNotes: adminNotes || null,
    offerStartDate,
    offerEndDate,
  });

  await sourcingRepository.update(sourcingRequestId, {
    status: "Offer ready",
    matches: [
      {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        status: "pending_member_approval",
        offerStartDate,
        offerEndDate,
      },
    ],
  });

  if (vehicle.status !== "In review" && vehicle.status !== "In Review") {
    await vehicle.update({ status: "In review" });
  }

  const full = await assignmentRepository.findById(assignment.id);

  notifyMember(targetMemberId, {
    type: "vehicle_status",
    title: "Vehicle offer ready",
    body: `${vehicle.make} ${vehicle.model} — review and approve to add to your garage.`,
    data: { sourcingRequestId, vehicleId, assignmentId: assignment.id, memberId: targetMemberId },
    persistInbox: true,
  }).catch(() => {});

  return {
    assignment: mapAssignment(full, member),
    message: "Vehicle assigned. Waiting for member approval.",
  };
};

exports.getPendingOfferForMember = async (sourcingRequestId, memberId) => {
  const request = await loadRequest(sourcingRequestId);
  if (request.memberId !== Number(memberId)) {
    throw new AppError("Sourcing request not found", 404);
  }
  const pending = await assignmentRepository.findPendingForRequest(sourcingRequestId);
  return {
    sourcingRequestId,
    hasPendingOffer: Boolean(pending),
    assignment: pending ? mapAssignment(pending) : null,
    inGarage: Boolean(pending),
    pendingApproval: Boolean(pending),
  };
};

exports.approveAssignment = async (sourcingRequestId, memberId) => {
  const request = await loadRequest(sourcingRequestId);
  if (request.memberId !== Number(memberId)) {
    throw new AppError("Sourcing request not found", 404);
  }

  const pending = await assignmentRepository.findPendingForRequest(sourcingRequestId);
  if (!pending) {
    throw new AppError("No pending vehicle offer for this request", 404);
  }

  const vehicle = await Vehicle.findByPk(pending.vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const member = await Member.findByPk(memberId);
  const ownerName = member
    ? [member.firstName, member.lastName].filter(Boolean).join(" ") || member.name
    : null;

  await vehicle.update({
    memberId: Number(memberId),
    ownershipType: "member",
    registrationStep: "complete",
    ownerName,
    status: "Stored",
  });

  await assignmentRepository.update(pending.id, {
    status: "approved",
    memberDecidedAt: new Date(),
  });

  await assignmentRepository.withdrawPendingForVehicleExcept(vehicle.id, pending.id);

  await sourcingRepository.update(sourcingRequestId, {
    status: "Completed",
    completedAt: new Date(),
    matches: [
      {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        status: "approved",
      },
    ],
  });

  const updated = await assignmentRepository.findById(pending.id);
  await vehicle.reload();

  return {
    approved: true,
    inGarage: true,
    assignment: mapAssignment(updated),
    vehicle: mapInventoryVehicle(vehicle),
    message: "Vehicle approved and added to your garage.",
  };
};

exports.rejectAssignment = async (sourcingRequestId, memberId, rejectionReason) => {
  const request = await loadRequest(sourcingRequestId);
  if (request.memberId !== Number(memberId)) {
    throw new AppError("Sourcing request not found", 404);
  }

  const pending = await assignmentRepository.findPendingForRequest(sourcingRequestId);
  if (!pending) {
    throw new AppError("No pending vehicle offer for this request", 404);
  }

  await assignmentRepository.update(pending.id, {
    status: "rejected",
    memberDecidedAt: new Date(),
    rejectionReason: rejectionReason || null,
  });

  const vehicle = await Vehicle.findByPk(pending.vehicleId);
  if (vehicle && vehicle.ownershipType === "inventory") {
    const stillPending = await assignmentRepository.countPendingForVehicle(vehicle.id);
    if (!stillPending) {
      await vehicle.update({ status: "Stored" });
    }
  }

  await sourcingRepository.update(sourcingRequestId, {
    status: "Searching for vehicle",
    matches: [],
  });

  const updated = await assignmentRepository.findById(pending.id);

  return {
    approved: false,
    inGarage: false,
    assignment: mapAssignment(updated),
    message: "Vehicle offer declined. It will not appear in your garage.",
  };
};

exports.listAssignmentsForRequest = async (sourcingRequestId) => {
  await loadRequest(sourcingRequestId);
  const rows = await assignmentRepository.findAllForRequest(sourcingRequestId);
  return { assignments: rows.map(mapAssignment) };
};
