"use strict";

const AppError = require("../../../utils/AppError");
const authService = require("../../auth/auth.service");
const membersRepository = require("./members.repository");
const {
  formatSummary,
  formatMemberCard,
  formatMemberDetail,
} = require("./members.formatter");
const { MEMBERSHIP_TIER_FILTERS } = require("./members.constants");

async function attachStats(members) {
  const ids = members.map((m) => m.id);
  const [vehicleCounts, eventCounts] = await Promise.all([
    membersRepository.loadVehicleCounts(ids),
    membersRepository.loadEventCounts(ids),
  ]);

  return members.map((member) =>
    formatMemberCard(member, {
      vehicles: vehicleCounts[member.id] || 0,
      events: eventCounts[member.id] || 0,
      miles: 0,
    }),
  );
}

exports.getSummary = async () => {
  const [totalMembers, vipTier, onPremises, retentionYtd] = await Promise.all([
    membersRepository.countTotalActive(),
    membersRepository.countByTier("black_card"),
    membersRepository.countOnPremises(),
    membersRepository.countRetentionYtd(),
  ]);

  return formatSummary({
    totalMembers,
    vipTier,
    onPremises,
    retentionYtd,
  });
};

exports.list = async (query) => {
  const [summary, total, rows] = await Promise.all([
    exports.getSummary(),
    membersRepository.countMembers(query),
    membersRepository.findMembers(query),
  ]);

  const members = await attachStats(rows);

  return {
    summary,
    filters: MEMBERSHIP_TIER_FILTERS,
    tier: query.tier || "all",
    members,
    total,
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  };
};

exports.getById = async (id) => {
  const member = await membersRepository.findMemberById(id);
  if (!member) throw new AppError("Member not found", 404);

  const [vehicleCounts, eventCounts] = await Promise.all([
    membersRepository.loadVehicleCounts([member.id]),
    membersRepository.loadEventCounts([member.id]),
  ]);

  return formatMemberDetail(member, {
    vehicles: vehicleCounts[member.id] || 0,
    events: eventCounts[member.id] || 0,
    miles: 0,
  });
};

exports.invite = async (payload) => authService.inviteMemberFromAdmin(payload);
