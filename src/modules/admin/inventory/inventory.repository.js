"use strict";

const { Op } = require("sequelize");
const { Vehicle } = require("../../../models");
const {
  READY_STATUSES,
  IN_SERVICE_STATUSES,
  SERVICE_OVERDUE_DAYS,
} = require("../fleet/fleet.constants");

const inventoryWhere = {
  ownershipType: "inventory",
};

function buildInventorySearchWhere(query = {}) {
  const where = { ...inventoryWhere };
  if (query.search) {
    const q = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { make: { [Op.iLike]: q } },
      { model: { [Op.iLike]: q } },
      { chassisNo: { [Op.iLike]: q } },
      { plate: { [Op.iLike]: q } },
    ];
  }
  if (query.status) where.status = query.status;
  return where;
}

function buildInventoryOverdueWhere() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SERVICE_OVERDUE_DAYS);
  const cutoffDate = cutoff.toISOString().slice(0, 10);
  return {
    [Op.or]: [
      { lastServicedAt: { [Op.lt]: cutoffDate } },
      { lastServicedAt: null, createdAt: { [Op.lt]: cutoff } },
    ],
  };
}

exports.create = (data) => Vehicle.create({ ...data, ...inventoryWhere });

exports.findAll = (query = {}) =>
  Vehicle.findAll({
    where: buildInventorySearchWhere(query),
    order: [["updatedAt", "DESC"]],
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  });

exports.count = (query = {}) => Vehicle.count({ where: buildInventorySearchWhere(query) });

exports.countSummary = async (query = {}) => {
  const baseWhere = buildInventorySearchWhere(query);
  const [total, ready, inService, overdueService] = await Promise.all([
    Vehicle.count({ where: baseWhere }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: READY_STATUSES } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, { status: { [Op.in]: IN_SERVICE_STATUSES } }] },
    }),
    Vehicle.count({
      where: { [Op.and]: [baseWhere, buildInventoryOverdueWhere()] },
    }),
  ]);

  return {
    total: {
      key: "total",
      label: "TOTAL",
      value: total,
      subLabel: "ALL INVENTORY VEHICLES",
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

exports.findByPk = (id) =>
  Vehicle.findOne({
    where: { id, ...inventoryWhere },
  });

exports.update = async (id, data) => {
  const row = await exports.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findByPk(id);
};

exports.destroy = async (id) => {
  const row = await exports.findByPk(id);
  if (!row) return false;
  await row.destroy();
  return true;
};
