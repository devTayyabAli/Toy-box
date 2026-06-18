"use strict";

const AppError = require("../../../utils/AppError");
const authService = require("../../auth/auth.service");
const staffRepository = require("./staff.repository");
const { formatSummary, formatStaffCard, formatStaffDetail } = require("./staff.formatter");
const { STAFF_STATUS_FILTERS } = require("./staff.constants");

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.getSummary = async () => {
  const [totalStaff, activeStaff, pendingActivation, invitedThisMonth] = await Promise.all([
    staffRepository.countTotalStaff(),
    staffRepository.countActiveStaff(),
    staffRepository.countPendingActivation(),
    staffRepository.countInvitedSince(startOfMonth()),
  ]);

  return formatSummary({
    totalStaff,
    activeStaff,
    pendingActivation,
    invitedThisMonth,
  });
};

exports.list = async (query) => {
  const [summary, total, rows] = await Promise.all([
    exports.getSummary(),
    staffRepository.countStaff(query),
    staffRepository.findStaff(query),
  ]);

  return {
    summary,
    filters: STAFF_STATUS_FILTERS,
    status: query.status || "all",
    staff: rows.map(formatStaffCard),
    total,
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  };
};

exports.getById = async (id) => {
  const staffMember = await staffRepository.findStaffById(id);
  if (!staffMember) throw new AppError("Staff member not found", 404);
  return formatStaffDetail(staffMember);
};

exports.invite = async (payload) => authService.inviteStaffFromAdmin(payload);
