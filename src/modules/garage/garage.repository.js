const { Op } = require("sequelize");
const { Vehicle, Request, Member } = require("../../models");
const { buildVehicleSearchWhere } = require("./garage.formatter");
const { VEHICLE_TYPE_TABS, GARAGE_STATUS_TABS } = require("./garage.constants");

function mapTabToVehicleType(vehicleType) {
  if (!vehicleType) return null;
  const tab = VEHICLE_TYPE_TABS.find(
    (t) => t.key === vehicleType || t.value === vehicleType,
  );
  return tab?.value || vehicleType;
}

function resolveGarageStatuses(garageStatus) {
  if (!garageStatus || garageStatus === "all") return null;
  const tab = GARAGE_STATUS_TABS.find((t) => t.key === garageStatus);
  return tab?.statuses || null;
}

/** Same rules as garage list/overview — complete registrations for this member. */
exports.countMemberGarageVehicles = (memberId) =>
  Vehicle.count({
    where: {
      memberId: Number(memberId),
      registrationStep: "complete",
    },
  });

exports.findVehicles = async ({ filter, memberId, search, vehicleType, garageStatus }) => {
  const where = {
    registrationStep: "complete",
    ...buildVehicleSearchWhere(search),
  };

  if (filter === "priority") {
    where.isPriority = true;
  } else if (filter === "mine" && memberId) {
    where.memberId = Number(memberId);
  }

  const mappedType = mapTabToVehicleType(vehicleType);
  if (mappedType) {
    where.vehicleType = mappedType;
  }

  const statuses = resolveGarageStatuses(garageStatus);
  if (statuses?.length) {
    where.status = { [Op.in]: statuses };
  }

  return Vehicle.findAll({
    where,
    order: [
      ["isPriority", "DESC"],
      ["updatedAt", "DESC"],
    ],
  });
};

exports.countGarageStatuses = async ({ filter, memberId, search }) => {
  const vehicles = await exports.findVehicles({ filter, memberId, search });
  const counts = { all: vehicles.length, ready: 0, in_service: 0, stored: 0, in_review: 0 };
  const { GARAGE_STATUS_MAP } = require("./garage.constants");
  for (const v of vehicles) {
    const key = GARAGE_STATUS_MAP[v.status] || "ready";
    if (counts[key] !== undefined) counts[key] += 1;
  }
  return counts;
};

exports.countVehiclesByType = async ({ filter, memberId, search }) => {
  const vehicles = await exports.findVehicles({ filter, memberId, search });
  const counts = { car: 0, bike: 0, other: 0 };
  for (const v of vehicles) {
    const t = v.vehicleType || "car";
    if (counts[t] !== undefined) counts[t] += 1;
  }
  return counts;
};

exports.findMemberById = (id) =>
  Member.findByPk(id, { attributes: ["id", "residence"] });

exports.findVehicleById = (id) =>
  Vehicle.findByPk(id, {
    include: [{ model: Member, as: "owner", attributes: ["id", "name", "email"] }],
  });

exports.updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    return null;
  }
  await vehicle.update(data);
  return vehicle.reload({
    include: [{ model: Member, as: "owner", attributes: ["id", "name", "email"] }],
  });
};

exports.findRequests = async ({ memberId, vehicleId, status, type, limit }) => {
  const where = {};
  if (memberId) where.memberId = memberId;
  if (vehicleId) where.vehicleId = vehicleId;
  if (status) where.status = status;
  if (type) where.type = type;

  return Request.findAll({
    where,
    include: [
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "make", "model", "year", "imageUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: limit || 50,
  });
};

exports.countRequestsByType = async (memberId) => {
  const where = memberId ? { memberId } : {};
  const rows = await Request.findAll({
    where,
    attributes: [
      "type",
      [Request.sequelize.fn("COUNT", Request.sequelize.col("id")), "count"],
    ],
    group: ["type"],
    raw: true,
  });
  return rows;
};

exports.createRequest = (data) => Request.create(data);

exports.findRequestById = (id) =>
  Request.findByPk(id, {
    include: [{ model: Vehicle, as: "vehicle" }],
  });
