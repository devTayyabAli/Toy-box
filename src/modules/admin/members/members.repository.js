"use strict";

const { Op, fn, col, literal } = require("sequelize");
const { Member, Role, Vehicle, EventRsvp } = require("../../../models");
const { normalizeMembershipTier } = require("./members.constants");

const memberInclude = {
  model: Role,
  as: "role",
  where: { name: "member" },
  required: true,
  attributes: ["id", "name"],
};

function activeMemberWhere(extra = {}) {
  return {
    mustChangePassword: false,
    ...extra,
  };
}

function buildTierWhere(tier) {
  if (!tier || tier === "all") return {};
  const normalized = normalizeMembershipTier(tier);
  return { membershipTier: normalized };
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
      { memberNumber: { [Op.iLike]: q } },
      { displayHandle: { [Op.iLike]: q } },
    ],
  };
}

exports.findMembers = async (query = {}) => {
  const where = {
    ...activeMemberWhere(),
    ...buildTierWhere(query.tier),
    ...buildSearchWhere(query.search),
  };

  return Member.findAll({
    where,
    include: [memberInclude],
    order: [["updatedAt", "DESC"]],
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  });
};

exports.countMembers = async (query = {}) => {
  const where = {
    ...activeMemberWhere(),
    ...buildTierWhere(query.tier),
    ...buildSearchWhere(query.search),
  };
  return Member.count({ where, include: [memberInclude] });
};

exports.findMemberById = (id) =>
  Member.findOne({
    where: { id: Number(id), ...activeMemberWhere() },
    include: [memberInclude],
  });

exports.countTotalActive = () =>
  Member.count({ where: activeMemberWhere(), include: [memberInclude] });

exports.countByTier = (tierKey) =>
  Member.count({
    where: activeMemberWhere({ membershipTier: tierKey }),
    include: [memberInclude],
  });

exports.countOnPremises = () =>
  Member.count({
    where: {
      ...activeMemberWhere(),
      [Op.and]: [literal(`"privacySettings"->>'showAtClub' = 'true'`)],
    },
    include: [memberInclude],
  });

exports.countRetentionYtd = async () => {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const [stillActive, joinedBeforeYear] = await Promise.all([
    Member.count({
      where: {
        ...activeMemberWhere(),
        createdAt: { [Op.lt]: yearStart },
      },
      include: [memberInclude],
    }),
    Member.count({
      where: { createdAt: { [Op.lt]: yearStart } },
      include: [memberInclude],
    }),
  ]);
  if (!joinedBeforeYear) return 100;
  return Math.round((stillActive / joinedBeforeYear) * 1000) / 10;
};

exports.loadVehicleCounts = async (memberIds) => {
  if (!memberIds.length) return {};
  const rows = await Vehicle.findAll({
    attributes: ["memberId", [fn("COUNT", col("id")), "count"]],
    where: {
      memberId: { [Op.in]: memberIds },
      registrationStep: "complete",
    },
    group: ["memberId"],
    raw: true,
  });
  return Object.fromEntries(rows.map((r) => [r.memberId, Number(r.count)]));
};

exports.loadEventCounts = async (memberIds) => {
  if (!memberIds.length) return {};
  const rows = await EventRsvp.findAll({
    attributes: ["memberId", [fn("COUNT", col("id")), "count"]],
    where: {
      memberId: { [Op.in]: memberIds },
      status: "confirmed",
    },
    group: ["memberId"],
    raw: true,
  });
  return Object.fromEntries(rows.map((r) => [r.memberId, Number(r.count)]));
};
