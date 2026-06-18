const { Op } = require("sequelize");
const {
  Booking,
  MaintenanceRequest,
  Request,
  TransportRequest,
  SourcingRequest,
  PaymentMethod,
  PaymentTransaction,
  EventRsvp,
} = require("../../models");
const { SERVICE_TYPE } = require("../detailing/detailing.constants");
const garageRepository = require("../garage/garage.repository");

const ACTIVE_STATUSES = {
  detailing: [
    "Request Received",
    "Awaiting confirmation",
    "Confirmed",
    "In Progress",
  ],
  maintenance: [
    "Request sent",
    "Vehicle picked up",
    "Service in progress",
    "Awaiting approval",
    "Ready for delivery",
  ],
  transport: [
    "Awaiting confirmation",
    "Request sent",
    "In transit",
    "Scheduled",
    "Confirmed",
  ],
  sourcing: [
    "Request received",
    "Searching for vehicle",
    "Vehicle found",
    "Inspection in progress",
    "Offer ready",
  ],
  request: ["Requested", "Accepted", "In Progress", "Upcoming"],
};
const {
  MEMBERSHIP_TIERS,
  normalizePrivacySettings,
} = require("./profile.defaults");
const staffRepository = require("../staff/staff.repository");
const authFormatter = require("./auth.formatter");

function fullName(firstName, lastName, fallbackName) {
  const parts = [firstName, lastName].filter(Boolean);
  if (parts.length) return parts.join(" ").trim();
  return fallbackName || "";
}

function memberDaysSince(createdAt) {
  if (!createdAt) return 0;
  const start = new Date(createdAt);
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

async function loadProfileStats(memberId) {
  const mid = Number(memberId);

  const [
    vehicleCount,
    bookingCount,
    maintenanceCount,
    detailingCount,
    activeGarageRequests,
    activeDetailing,
    activeMaintenance,
    activeTransport,
    activeSourcing,
  ] = await Promise.all([
    garageRepository.countMemberGarageVehicles(mid),
    Booking.count({ where: { memberId: mid } }),
    MaintenanceRequest.count({ where: { memberId: mid } }),
    Booking.count({ where: { memberId: mid, serviceType: SERVICE_TYPE } }),
    Request.count({
      where: { memberId: mid, status: { [Op.in]: ACTIVE_STATUSES.request } },
    }),
    Booking.count({
      where: {
        memberId: mid,
        serviceType: SERVICE_TYPE,
        status: { [Op.in]: ACTIVE_STATUSES.detailing },
      },
    }),
    MaintenanceRequest.count({
      where: { memberId: mid, status: { [Op.in]: ACTIVE_STATUSES.maintenance } },
    }),
    TransportRequest.count({
      where: { memberId: mid, status: { [Op.in]: ACTIVE_STATUSES.transport } },
    }),
    SourcingRequest.count({
      where: { memberId: mid, status: { [Op.in]: ACTIVE_STATUSES.sourcing } },
    }),
  ]);

  const activeRequests =
    activeGarageRequests +
    activeDetailing +
    activeMaintenance +
    activeTransport +
    activeSourcing;

  return {
    vehicleCount,
    bookingCount: bookingCount + maintenanceCount,
    bookingsCount: bookingCount + maintenanceCount,
    detailingCount,
    maintenanceCount,
    activeRequests,
    activeBookings: activeRequests,
    activeGarageRequests,
    activeDetailing,
    activeMaintenance,
    activeTransport,
    activeSourcing,
    eventsAttended: await EventRsvp.count({
      where: { memberId: mid, status: "confirmed" },
    }),
    milesDriven: 0,
  };
}

async function loadStaffProfileStats(staffMemberId) {
  const shiftStats = await staffRepository.getShiftStatsForToday(staffMemberId);
  return {
    tasksCompleted: shiftStats.tasksCompleted,
    tasksTotal: shiftStats.tasksTotal,
    vehiclesHandled: shiftStats.vehiclesMoved + shiftStats.inspectionsDone,
    inspectionsDone: shiftStats.inspectionsDone,
    photosUploaded: shiftStats.photosUploaded,
    serviceConfirmations: shiftStats.serviceConfirmations,
  };
}

function notificationSummary(settings) {
  const prefs = settings?.preferences || settings || {};
  return {
    pushEnabled: prefs.pushEnabled !== false,
    emailEnabled: prefs.emailEnabled !== false,
    smsEnabled: prefs.smsEnabled === true,
  };
}

function buildMemberSections(member, plain, privacy, tier) {
  const displayName = fullName(plain.firstName, plain.lastName, plain.name);
  return {
    account: {
      personalInformation: {
        title: "Personal Information",
        subtitle: "Name, Contact, Address",
        name: displayName,
        email: plain.email,
        phone: plain.mobile,
        address: plain.residence,
      },
      billingAndPayments: {
        title: "Billing & Payments",
        subtitle: "Cards, Invoices, Statements",
        path: "/api/v1/auth/profile/billing",
      },
      membershipTier: {
        title: "Membership Tier",
        subtitle: tier.description,
        tier: tier.key,
        tierLabel: tier.label,
        status: "ACTIVE",
      },
    },
    preferences: {
      notifications: {
        title: "Notifications",
        subtitle: "Channels & Alerts",
        ...notificationSummary(plain.notificationSettings),
        path: "/api/v1/notifications/inbox",
      },
      privacy: {
        title: "Privacy",
        subtitle: "Visibility & Data",
        ...privacy,
        path: "/api/v1/auth/profile/privacy",
      },
      security: {
        title: "Security & 2FA",
        subtitle: "Authentication",
        twoFactorEnabled: Boolean(plain.twoFactorEnabled),
        statusLabel: plain.twoFactorEnabled ? "ON" : "OFF",
      },
    },
    vehiclePreferences: {
      favouritesAndDrivers: {
        title: "Favourites & Drivers",
        subtitle: "Preferred drivers",
        preferredDriver: null,
      },
      defaultSummonTime: {
        title: "Default Summon Time",
        value: "30 MIN",
      },
      cabinTemperature: {
        title: "Cabin Temperature",
        value: "21°C",
      },
    },
    connected: {
      steveMemory: {
        title: "Steve's Memory",
        subtitle: "What Steve remembers about you",
        path: "/api/v1/chat/conversation",
      },
      downloadMyData: {
        title: "Download My Data",
        subtitle: "Export your account archive",
        available: true,
      },
    },
  };
}

function buildStaffSections(member, plain, privacy, roleName) {
  const displayName = fullName(plain.firstName, plain.lastName, plain.name);
  return {
    account: {
      personalInformation: {
        title: "Personal Information",
        subtitle: "Name, Contact, Address",
        name: displayName,
        email: plain.email,
        phone: plain.mobile,
        address: plain.residence,
      },
      workProfile: {
        title: "Work Profile",
        subtitle: "Role & department",
        jobTitle: plain.jobTitle || (roleName === "admin" ? "Administrator" : "Operative"),
        role: roleName,
        status: "ACTIVE",
      },
    },
    preferences: {
      notifications: {
        title: "Notifications",
        subtitle: "Channels & Alerts",
        ...notificationSummary(plain.notificationSettings),
        path: "/api/v1/notifications/inbox",
      },
      privacy: {
        title: "Privacy",
        subtitle: "Visibility & Data",
        ...privacy,
        path: "/api/v1/auth/profile/privacy",
      },
      security: {
        title: "Security & 2FA",
        subtitle: "Authentication",
        twoFactorEnabled: Boolean(plain.twoFactorEnabled),
        statusLabel: plain.twoFactorEnabled ? "ON" : "OFF",
      },
    },
    connected: {
      downloadMyData: {
        title: "Download My Data",
        subtitle: "Export your account archive",
        available: true,
      },
    },
  };
}

function formatMemberProfile(member, stats) {
  const base = formatProfileCore(member, stats);
  const plain = member.get ? member.get({ plain: true }) : member;
  const privacy = normalizePrivacySettings(plain.privacySettings);
  const tier = formatMembershipTier(plain.membershipTier);

  return {
    ...base,
    role: "member",
    panel: "member",
    headerStats: [
      { key: "vehicles", label: "Vehicles", value: stats.vehicleCount },
      { key: "events_attended", label: "Events Attended", value: stats.eventsAttended || 0 },
      { key: "days_as_member", label: "Days as Member", value: base.memberDays },
      { key: "miles_driven", label: "Miles Driven", value: stats.milesDriven || 0 },
    ],
    sections: buildMemberSections(member, plain, privacy, tier),
  };
}

function formatStaffProfile(member, stats, roleName) {
  const plain = member.get ? member.get({ plain: true }) : member;
  const privacy = normalizePrivacySettings(plain.privacySettings);
  const displayName = fullName(plain.firstName, plain.lastName, plain.name);
  const memberDays = memberDaysSince(plain.createdAt);
  const panel = roleName === "admin" ? "admin" : "staff";

  return {
    id: plain.id,
    email: plain.email,
    firstName: plain.firstName,
    lastName: plain.lastName,
    name: plain.name || displayName,
    fullName: displayName,
    displayHandle: plain.displayHandle,
    jobTitle: plain.jobTitle || (roleName === "admin" ? "Administrator" : null),
    mobile: plain.mobile,
    mobileCountryCode: plain.mobileCountryCode || "+971",
    phone: plain.mobile,
    residence: plain.residence,
    address: plain.residence,
    profileImageUrl: plain.profileImageUrl,
    profileImage: plain.profileImageUrl,
    coverImageUrl: plain.coverImageUrl,
    coverImage: plain.coverImageUrl,
    role: roleName,
    panel,
    roleDetail: authFormatter.roleProfile(member),
    twoFactorEnabled: Boolean(plain.twoFactorEnabled),
    privacySettings: privacy,
    memberSince: plain.createdAt,
    memberDays,
    stats: {
      tasksCompleted: stats.tasksCompleted,
      tasksTotal: stats.tasksTotal,
      vehiclesHandled: stats.vehiclesHandled,
      inspectionsDone: stats.inspectionsDone,
      photosUploaded: stats.photosUploaded,
      serviceConfirmations: stats.serviceConfirmations,
      daysEmployed: memberDays,
    },
    headerStats: [
      { key: "tasks_completed", label: "Tasks Completed", value: stats.tasksCompleted },
      { key: "vehicles_handled", label: "Vehicles Handled", value: stats.vehiclesHandled },
      { key: "days_employed", label: "Days Employed", value: memberDays },
      { key: "inspections_done", label: "Inspections Done", value: stats.inspectionsDone },
    ],
    sections: buildStaffSections(member, plain, privacy, roleName),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function formatProfileCore(member, stats) {
  const plain = member.get ? member.get({ plain: true }) : member;
  const privacy = normalizePrivacySettings(plain.privacySettings);
  const tier = formatMembershipTier(plain.membershipTier);
  const displayName = fullName(plain.firstName, plain.lastName, plain.name);
  const memberDays = memberDaysSince(plain.createdAt);

  return {
    id: plain.id,
    email: plain.email,
    firstName: plain.firstName,
    lastName: plain.lastName,
    name: plain.name || displayName,
    fullName: displayName,
    displayHandle: plain.displayHandle,
    memberNumber: plain.memberNumber,
    idNumber: plain.memberNumber,
    idNumberLabel: plain.memberNumber ? `ID NO. ${plain.memberNumber}` : "",
    memberNumberLabel: plain.memberNumber ? `No. ${plain.memberNumber}` : "",
    jobTitle: plain.jobTitle,
    title: plain.jobTitle,
    mobile: plain.mobile,
    mobileCountryCode: plain.mobileCountryCode || "+971",
    phone: plain.mobile,
    residence: plain.residence,
    address: plain.residence,
    profileImageUrl: plain.profileImageUrl,
    profileImage: plain.profileImageUrl,
    coverImageUrl: plain.coverImageUrl,
    coverImage: plain.coverImageUrl,
    roleId: plain.roleId,
    role: plain.role ? { id: plain.role.id, name: plain.role.name } : null,
    membershipTier: tier.key,
    membershipTierLabel: tier.label,
    membershipStatus: tier.statusLabel,
    membership: tier,
    membershipCard: {
      memberNumber: plain.memberNumber,
      idNumberLabel: plain.memberNumber ? `ID NO. ${plain.memberNumber}` : "",
      tier: tier.key,
      tierLabel: tier.label,
    },
    twoFactorEnabled: Boolean(plain.twoFactorEnabled),
    privacySettings: privacy,
    memberSince: plain.createdAt,
    memberDays,
    stats: {
      bookingCount: stats.bookingCount,
      bookingsCount: stats.bookingsCount,
      vehicleCount: stats.vehicleCount,
      vehiclesInGarage: stats.vehicleCount,
      memberDays,
      eventsAttended: stats.eventsAttended || 0,
      milesDriven: stats.milesDriven || 0,
      detailingCount: stats.detailingCount,
      maintenanceCount: stats.maintenanceCount,
      activeRequests: stats.activeRequests,
      activeBookings: stats.activeBookings,
      activeGarageRequests: stats.activeGarageRequests,
      activeDetailing: stats.activeDetailing,
      activeMaintenance: stats.activeMaintenance,
      activeTransport: stats.activeTransport,
      activeSourcing: stats.activeSourcing,
    },
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function loadBillingSummary(memberId, member) {
  const [paymentMethodsCount, pendingMaintenance] = await Promise.all([
    PaymentMethod.count({ where: { memberId } }),
    MaintenanceRequest.findAll({
      where: { memberId, status: "Awaiting approval" },
      attributes: ["totalAmount"],
    }),
  ]);

  const balanceDueAed = pendingMaintenance.reduce(
    (sum, row) => sum + (Number(row.totalAmount) || 0),
    0,
  );

  const paidTx = await PaymentTransaction.findAll({
    where: { memberId, status: "paid" },
    order: [["createdAt", "DESC"]],
    limit: 12,
  });

  const invoices = paidTx.map((tx) => {
    const row = tx.get ? tx.get({ plain: true }) : tx;
    const d = new Date(row.createdAt);
    const quarter = Math.ceil((d.getMonth() + 1) / 3);
    return {
      id: row.id,
      label: `${row.purpose} payment`,
      quarter: `Q${quarter} ${d.getFullYear()}`,
      month: d.toLocaleString("en-US", { month: "long" }),
      amountAed: row.amount,
      currency: row.currency || "AED",
      status: "Paid",
      paidAt: row.createdAt,
    };
  });

  if (balanceDueAed > 0) {
    invoices.unshift({
      id: "upcoming",
      label: "Membership & services",
      quarter: null,
      month: null,
      amountAed: balanceDueAed,
      currency: "AED",
      status: "Upcoming",
      paidAt: null,
    });
  }

  return {
    balanceDueAed,
    currency: "AED",
    nextBillingDate: member.nextBillingDate || null,
    paymentMethodsCount,
    invoices,
  };
}

function formatMembershipTier(tierKey) {
  const key = tierKey || "principal";
  const tier = MEMBERSHIP_TIERS[key] || MEMBERSHIP_TIERS.principal;
  return {
    key: tier.key,
    label: tier.label,
    description: tier.description,
    statusLabel: tier.label.toUpperCase(),
  };
}

function formatProfile(member, stats) {
  return formatMemberProfile(member, stats);
}

async function buildProfileResponse(member) {
  const roleName = authFormatter.resolveRole(member);
  if (roleName === "staff" || roleName === "admin") {
    const stats = await loadStaffProfileStats(member.id);
    return formatStaffProfile(member, stats, roleName);
  }
  const stats = await loadProfileStats(member.id);
  return formatMemberProfile(member, stats);
}

module.exports = {
  fullName,
  loadProfileStats,
  loadStaffProfileStats,
  loadBillingSummary,
  formatProfile,
  formatMemberProfile,
  formatStaffProfile,
  buildProfileResponse,
  formatMembershipTier,
  normalizePrivacySettings,
};
