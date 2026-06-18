"use strict";

function displayName(member) {
  const m = member.get ? member.get({ plain: true }) : member;
  const titled = [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
  if (titled) return titled;
  return m.name || m.email || "Staff";
}

function formatLastSeen(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return `${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} today`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

exports.formatSummary = (data) => ({
  totalStaff: {
    key: "total_staff",
    label: "TOTAL STAFF",
    value: data.totalStaff,
    subLabel: "OPERATIVES",
  },
  activeStaff: {
    key: "active_staff",
    label: "ACTIVE",
    value: data.activeStaff,
    subLabel: "ON SYSTEM",
  },
  pendingActivation: {
    key: "pending_activation",
    label: "PENDING ACTIVATION",
    value: data.pendingActivation,
    subLabel: "INVITE SENT",
  },
  invitedThisMonth: {
    key: "invited_this_month",
    label: "INVITED THIS MONTH",
    value: data.invitedThisMonth,
    subLabel: "NEW HIRES",
  },
});

exports.formatStaffCard = (member) => {
  const m = member.get ? member.get({ plain: true }) : member;
  return {
    id: m.id,
    displayName: displayName(member),
    email: m.email,
    jobTitle: m.jobTitle || "Operative",
    role: m.role?.name || "staff",
    accountStatus: m.mustChangePassword ? "pending_activation" : "active",
    lastSeen: formatLastSeen(m.updatedAt),
    profileImageUrl: m.profileImageUrl || null,
    invitedAt: m.invitedAt,
    invitationAcceptedAt: m.invitationAcceptedAt,
  };
};

exports.formatStaffDetail = (member) => {
  const card = exports.formatStaffCard(member);
  const m = member.get ? member.get({ plain: true }) : member;
  return {
    ...card,
    firstName: m.firstName,
    lastName: m.lastName,
    mobile: m.mobile,
    mobileCountryCode: m.mobileCountryCode,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};
