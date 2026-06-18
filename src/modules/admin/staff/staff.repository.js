"use strict";

const { Op } = require("sequelize");
const { Member, Role } = require("../../../models");

const staffInclude = {
  model: Role,
  as: "role",
  where: { name: "staff" },
  required: true,
  attributes: ["id", "name"],
};

function buildStatusWhere(status) {
  if (!status || status === "all") return {};
  if (status === "pending_activation") return { mustChangePassword: true };
  if (status === "active") return { mustChangePassword: false };
  return {};
}

function buildSearchWhere(search) {
  if (!search?.trim()) return {};
  const q = `%${String(search).trim()}%`;
  return {
    [Op.or]: [
      { email: { [Op.iLike]: q } },
      { firstName: { [Op.iLike]: q } },
      { lastName: { [Op.iLike]: q } },
      { name: { [Op.iLike]: q } },
      { jobTitle: { [Op.iLike]: q } },
    ],
  };
}

exports.findStaff = async (query = {}) => {
  const where = {
    ...buildStatusWhere(query.status),
    ...buildSearchWhere(query.search),
  };

  return Member.findAll({
    where,
    include: [staffInclude],
    order: [["updatedAt", "DESC"]],
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  });
};

exports.countStaff = async (query = {}) => {
  const where = {
    ...buildStatusWhere(query.status),
    ...buildSearchWhere(query.search),
  };
  return Member.count({ where, include: [staffInclude] });
};

exports.findStaffById = (id) =>
  Member.findOne({
    where: { id: Number(id) },
    include: [staffInclude],
  });

exports.countTotalStaff = () =>
  Member.count({ include: [staffInclude] });

exports.countActiveStaff = () =>
  Member.count({
    where: { mustChangePassword: false },
    include: [staffInclude],
  });

exports.countPendingActivation = () =>
  Member.count({
    where: { mustChangePassword: true },
    include: [staffInclude],
  });

exports.countInvitedSince = (since) =>
  Member.count({
    where: { invitedAt: { [Op.gte]: since } },
    include: [staffInclude],
  });
