"use strict";

const { tierLabel } = require("./members.constants");

function displayName(member) {
  const m = member.get ? member.get({ plain: true }) : member;
  const titled = [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
  if (titled) return titled.toUpperCase();
  return (m.name || m.email || "Member").toUpperCase();
}

function formatMemberSince(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

function formatLastSeen(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " today";
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function memberDaysSince(createdAt) {
  if (!createdAt) return 0;
  const start = new Date(createdAt);
  return Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
}

function formatHeaderStats(member, stats = {}) {
  return {
    vehicles: stats.vehicles ?? 0,
    events: stats.events ?? 0,
    miles: stats.miles ?? 0,
    days: memberDaysSince(member.createdAt),
  };
}

exports.formatSummary = (data) => ({
  totalMembers: {
    key: "total_members",
    label: "TOTAL MEMBERS",
    value: data.totalMembers,
    subLabel: "FOUNDING",
  },
  vipTier: {
    key: "vip_tier",
    label: "VIP TIER",
    value: data.vipTier,
    subLabel: "TOP SPEND",
  },
  onPremises: {
    key: "on_premises",
    label: "ON PREMISES",
    value: data.onPremises,
    subLabel: "REAL-TIME",
  },
  retentionYtd: {
    key: "retention_ytd",
    label: "RETENTION - YTD",
    value: data.retentionYtd,
    subLabel: "%",
    displayValue: `${data.retentionYtd}%`,
  },
});

exports.formatMemberCard = (member, stats = {}) => {
  const m = member.get ? member.get({ plain: true }) : member;
  const tier = m.membershipTier || "principal";
  const sinceDate = m.invitationAcceptedAt || m.createdAt;

  return {
    id: m.id,
    memberNumber: m.memberNumber,
    memberNumberLabel: m.memberNumber ? `NO. ${m.memberNumber}` : null,
    displayName: displayName(member),
    email: m.email,
    membershipTier: tier,
    tierLabel: tierLabel(tier),
    memberSince: formatMemberSince(sinceDate),
    memberSinceLabel: sinceDate
      ? `NO. ${m.memberNumber || m.id} — SINCE ${formatMemberSince(sinceDate)}`
      : null,
    lastSeen: formatLastSeen(m.updatedAt),
    profileImageUrl: m.profileImageUrl || null,
    headerStats: formatHeaderStats(m, stats),
    onPremises: Boolean(m.privacySettings?.showAtClub),
    accountStatus: m.mustChangePassword ? "pending_activation" : "active",
  };
};

exports.formatMemberDetail = (member, stats = {}) => {
  const card = exports.formatMemberCard(member, stats);
  const m = member.get ? member.get({ plain: true }) : member;
  return {
    ...card,
    firstName: m.firstName,
    lastName: m.lastName,
    mobile: m.mobile,
    mobileCountryCode: m.mobileCountryCode,
    residence: m.residence,
    displayHandle: m.displayHandle,
    membershipValidUntil: m.nextBillingDate || null,
    membershipValidityMonths: m.membershipValidityMonths || null,
    invitedAt: m.invitedAt,
    invitationAcceptedAt: m.invitationAcceptedAt,
    privacySettings: m.privacySettings || null,
  };
};
