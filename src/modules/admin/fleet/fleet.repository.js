"use strict";

const { Op } = require("sequelize");
const { Vehicle, Member } = require("../../../models");
const {
  READY_STATUSES,
  IN_SERVICE_STATUSES,
  STORED_STATUSES,
  SERVICE_OVERDUE_DAYS,
  FLEET_BASE_WHERE,
  TOTAL_STORAGE_BAYS,
} = require("./fleet.constants");

function serviceOverdueCutoffDate() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SERVICE_OVERDUE_DAYS);
  return cutoff;
}

function buildSearchWhere(search) {
  if (!search?.trim()) return {};
  const q = `%${String(search).trim()}%`;
  return {
    [Op.or]: [
      { make: { [Op.iLike]: q } },
      { model: { [Op.iLike]: q } },
      { plate: { [Op.iLike]: q } },
      { chassisNo: { [Op.iLike]: q } },
      { ownerName: { [Op.iLike]: q } },
      { storageBay: { [Op.iLike]: q } },
    ],
  };
}

function buildListWhere(query = {}) {
  const conditions = [{ ...FLEET_BASE_WHERE }];

  const searchWhere = buildSearchWhere(query.search);
  if (Object.keys(searchWhere).length) {
    conditions.push(searchWhere);
  }

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.storageBay) {
    conditions.push({ storageBay: { [Op.iLike]: `%${String(query.storageBay).trim()}%` } });
  }

  if (query.summaryKey === "ready") {
    conditions.push({ status: { [Op.in]: READY_STATUSES } });
  } else if (query.summaryKey === "in_service") {
    conditions.push({ status: { [Op.in]: IN_SERVICE_STATUSES } });
  } else if (query.summaryKey === "in_storage") {
    conditions.push({ status: { [Op.in]: STORED_STATUSES } });
  } else if (query.summaryKey === "overdue_service") {
    conditions.push(buildOverdueWhere());
  }

  return conditions.length === 1 ? conditions[0] : { [Op.and]: conditions };
}

function buildOverdueWhere() {
  const cutoff = serviceOverdueCutoffDate();
  const cutoffDate = cutoff.toISOString().slice(0, 10);
  return {
    [Op.or]: [
      { lastServicedAt: { [Op.lt]: cutoffDate } },
      { lastServicedAt: null, createdAt: { [Op.lt]: cutoff } },
    ],
  };
}

function isOverdueVehicle(vehicle) {
  const plain = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const cutoff = serviceOverdueCutoffDate();
  if (plain.lastServicedAt) {
    return new Date(plain.lastServicedAt) < cutoff;
  }
  return plain.createdAt && new Date(plain.createdAt) < cutoff;
}

exports.findAll = (query = {}) =>
  Vehicle.findAll({
    where: buildListWhere(query),
    include: [
      {
        model: Member,
        as: "owner",
        attributes: ["id", "firstName", "lastName", "name", "email", "profileImageUrl"],
        required: false,
      },
    ],
    order: [
      ["isPriority", "DESC"],
      ["updatedAt", "DESC"],
    ],
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  });

exports.count = (query = {}) => Vehicle.count({ where: buildListWhere(query) });

exports.findById = (id) =>
  Vehicle.findOne({
    where: { id: Number(id), ...FLEET_BASE_WHERE },
    include: [
      {
        model: Member,
        as: "owner",
        attributes: ["id", "firstName", "lastName", "name", "email", "profileImageUrl"],
        required: false,
      },
    ],
  });

exports.countOccupiedBays = () =>
  Vehicle.count({
    where: {
      ...FLEET_BASE_WHERE,
      storageBay: { [Op.ne]: null },
    },
  });

exports.countDashboardSummary = async (query = {}) => {
  const baseConditions = [{ ...FLEET_BASE_WHERE }];
  const searchWhere = buildSearchWhere(query.search);
  if (Object.keys(searchWhere).length) {
    baseConditions.push(searchWhere);
  }

  const baseWhere =
    baseConditions.length === 1 ? baseConditions[0] : { [Op.and]: baseConditions };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalVehicles,
    inStorage,
    inService,
    occupiedBays,
    vehiclesAddedThisMonth,
    totalAtMonthStart,
  ] = await Promise.all([
    Vehicle.count({ where: baseWhere }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: STORED_STATUSES } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: IN_SERVICE_STATUSES } }] },
    }),
    exports.countOccupiedBays(),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { createdAt: { [Op.gte]: startOfMonth } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { createdAt: { [Op.lt]: startOfMonth } }] },
    }),
  ]);

  const bayUtilization = TOTAL_STORAGE_BAYS
    ? Math.min(100, Math.round((totalVehicles / TOTAL_STORAGE_BAYS) * 100))
    : 0;

  const previousBayUtilization = TOTAL_STORAGE_BAYS
    ? Math.min(100, Math.round((totalAtMonthStart / TOTAL_STORAGE_BAYS) * 100))
    : 0;

  return {
    totalVehicles,
    inStorage,
    inService,
    occupiedBays,
    totalBays: TOTAL_STORAGE_BAYS,
    bayUtilization,
    vehiclesAddedThisMonth,
    bayUtilizationTrend: bayUtilization - previousBayUtilization,
  };
};

exports.findAllWithBay = (query = {}) =>
  Vehicle.findAll({
    where: {
      ...buildListWhere(query),
      storageBay: { [Op.ne]: null },
    },
    include: [
      {
        model: Member,
        as: "owner",
        attributes: ["id", "firstName", "lastName", "name", "email", "profileImageUrl"],
        required: false,
      },
    ],
    order: [["storageBay", "ASC"]],
  });

exports.countSummary = async (query = {}) => {
  const baseConditions = [{ ...FLEET_BASE_WHERE }];
  const searchWhere = buildSearchWhere(query.search);
  if (Object.keys(searchWhere).length) {
    baseConditions.push(searchWhere);
  }
  if (query.storageBay) {
    baseConditions.push({
      storageBay: { [Op.iLike]: `%${String(query.storageBay).trim()}%` },
    });
  }

  const baseWhere =
    baseConditions.length === 1 ? baseConditions[0] : { [Op.and]: baseConditions };

  const [total, ready, inService, overdueService] = await Promise.all([
    Vehicle.count({ where: baseWhere }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: READY_STATUSES } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: IN_SERVICE_STATUSES } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, buildOverdueWhere()] },
    }),
  ]);

  return {
    total: {
      key: "total",
      label: "TOTAL",
      value: total,
      subLabel: "ALL STORED VEHICLES",
    },
    ready: {
      key: "ready",
      label: "READY",
      value: ready,
      subLabel: total ? `${Math.round((ready / total) * 1000) / 10}% OF FLEET` : "0% OF FLEET",
    },
    inService: {
      key: "in_service",
      label: "IN SERVICE",
      value: inService,
      subLabel: "WORKSHOP + DETAILING",
    },
    overdueService: {
      key: "overdue_service",
      label: "OVERDUE SERVICE",
      value: overdueService,
      subLabel: "NEEDS ACTION",
    },
  };
};

exports.isOverdueVehicle = isOverdueVehicle;
