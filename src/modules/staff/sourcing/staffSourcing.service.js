"use strict";

const AppError = require("../../../utils/AppError");
const sourcingService = require("../../sourcing/sourcing.service");
const assignmentService = require("../../sourcing/sourcingAssignment.service");
const repository = require("./staffSourcing.repository");
const staffRepository = require("../staff.repository");
const { toStaffSummary } = require("../../sourcing/sourcing.formatter");

function memberDisplayName(member) {
  if (!member) return null;
  const m = member.get ? member.get({ plain: true }) : member;
  return (
    [m.firstName, m.lastName].filter(Boolean).join(" ") ||
    m.name ||
    m.email ||
    null
  );
}

function mapStaffOnDuty(rows) {
  return rows.map((member) => {
    const m = member.get ? member.get({ plain: true }) : member;
    return {
      id: m.id,
      name: memberDisplayName(m),
      role: m.jobTitle || m.role?.name || "staff",
      status: "active",
      profileImageUrl: m.profileImageUrl || null,
    };
  });
}

function mapVehicleOption(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return {
    id: v.id,
    label: [v.make, v.model].filter(Boolean).join(" "),
    make: v.make,
    model: v.model,
    year: v.year,
    imageUrl: v.imageUrl || null,
    status: v.status,
  };
}

exports.getSummary = () => repository.countSummary();

exports.listRequests = async (query) => {
  const [summary, list, inReviewBookings, staffOnDutyRows] = await Promise.all([
    repository.countSummary(),
    sourcingService.listRequestsForAdmin(query),
    repository.listInReviewBookings(),
    staffRepository.listStaffOnDuty(),
  ]);

  const pendingMap = await repository.mapPendingAssignments(
    list.requests.map((request) => request.id),
  );

  return {
    summary,
    inReviewBookings,
    staffOnDuty: mapStaffOnDuty(staffOnDutyRows),
    total: list.total,
    count: list.count,
    limit: list.limit,
    offset: list.offset,
    requests: list.requests.map((request) =>
      toStaffSummary(request, pendingMap.get(request.id) || null),
    ),
  };
};

exports.getRequest = async (id) => {
  const data = await sourcingService.getRequest(id);
  const assignments = await assignmentService.listAssignmentsForRequest(id);
  const pendingMap = await repository.mapPendingAssignments([Number(id)]);
  return {
    ...toStaffSummary(data, pendingMap.get(Number(id)) || null),
    ...assignments,
  };
};

exports.getOfferOptions = async (requestId) => {
  const [request, vehicles] = await Promise.all([
    repository.loadRequestForOffer(requestId),
    repository.listInventoryVehiclesForOffer(),
  ]);

  if (!request) throw new AppError("Sourcing request not found", 404);

  const plain = request.get ? request.get({ plain: true }) : request;
  const member = plain.member;

  return {
    requestId: plain.id,
    referenceNumber: plain.referenceNumber,
    member: member
      ? {
          id: member.id,
          name: memberDisplayName(member),
          email: member.email || null,
          profileImageUrl: member.profileImageUrl || null,
        }
      : { id: plain.memberId, name: null, email: null, profileImageUrl: null },
    vehicles: vehicles.map(mapVehicleOption),
  };
};

exports.assignVehicle = (sourcingRequestId, vehicleId, staffMemberId, options) =>
  assignmentService.assignVehicleToRequest(sourcingRequestId, vehicleId, staffMemberId, options);

exports.listAssignments = (sourcingRequestId) =>
  assignmentService.listAssignmentsForRequest(sourcingRequestId);
