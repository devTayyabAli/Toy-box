"use strict";

const AppError = require("../../utils/AppError");
const {
  HEALTH_ALERT_THRESHOLD,
  HEALTH_CRITICAL_THRESHOLD,
  SHIFT_WINDOWS,
} = require("./staff.constants");
const repository = require("./staff.repository");

function displayName(member) {
  const plain = member.get ? member.get({ plain: true }) : member;
  return (
    [plain.firstName, plain.lastName].filter(Boolean).join(" ") ||
    plain.name ||
    plain.email
  );
}

function formatTime(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(minutes) {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function resolveShift(now = new Date()) {
  const hour = now.getHours();
  const window =
    SHIFT_WINDOWS.find((w) =>
      w.startHour < w.endHour
        ? hour >= w.startHour && hour < w.endHour
        : hour >= w.startHour || hour < w.endHour,
    ) || SHIFT_WINDOWS[0];

  const shiftEnd = new Date(now);
  shiftEnd.setHours(window.endHour, 0, 0, 0);
  if (shiftEnd <= now) shiftEnd.setDate(shiftEnd.getDate() + 1);

  const shiftStart = new Date(now);
  shiftStart.setHours(window.startHour, 0, 0, 0);
  if (shiftStart > now) shiftStart.setDate(shiftStart.getDate() - 1);

  const remainingMinutes = Math.max(0, Math.round((shiftEnd - now) / 60000));

  return {
    key: window.key,
    label: window.label,
    date: now.toISOString().slice(0, 10),
    displayDate: now.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    startTime: `${String(window.startHour).padStart(2, "0")}:00`,
    endTime: `${String(window.endHour).padStart(2, "0")}:00`,
    timeRemainingMinutes: remainingMinutes,
    timeRemainingLabel: formatDuration(remainingMinutes),
  };
}

function mapHealthAlerts(vehicles) {
  const alerts = [];
  const categoryLabels = {
    tyres: "Tyre pressure low",
    battery: "Battery drain warning",
    engine_drivetrain: "Engine / drivetrain attention",
    brakes: "Brakes need review",
    fluids: "Fluids check required",
    exterior_body: "Exterior inspection due",
  };

  for (const vehicle of vehicles) {
    const plain = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
    const health = Array.isArray(plain.health) ? plain.health : [];
    for (const item of health) {
      const pct = Number(item.percentage);
      if (!Number.isFinite(pct) || pct >= HEALTH_ALERT_THRESHOLD) continue;
      alerts.push({
        id: `health-${plain.id}-${item.category}`,
        type: item.category,
        severity: pct < HEALTH_CRITICAL_THRESHOLD ? "critical" : "warning",
        vehicleId: plain.id,
        vehicleLabel: [plain.make, plain.model].filter(Boolean).join(" "),
        bay: plain.storageBay || null,
        message:
          item.note ||
          categoryLabels[item.category] ||
          `${item.category} at ${pct}%`,
        percentage: pct,
      });
    }
  }

  return alerts.sort((a, b) => a.percentage - b.percentage).slice(0, 10);
}

function mapPriorityTasks(items) {
  const mapped = items.map((item) => {
    const isUrgent =
      item.urgency === "in_progress" ||
      (item.scheduledAt && new Date(item.scheduledAt) <= new Date(Date.now() + 60 * 60 * 1000));

    return {
      id: item.id,
      title: item.title,
      vehicleLabel: item.vehicleLabel,
      detail: item.detail,
      bay: item.bay,
      scheduledAt: item.scheduledAt,
      timeLabel: formatTime(item.scheduledAt) || "Now",
      status: item.status,
      urgency: isUrgent ? "urgent" : item.urgency,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
    };
  });

  const urgentCount = mapped.filter((t) => t.urgency === "urgent" || t.urgency === "in_progress").length;
  return { urgentCount, items: mapped.slice(0, 8) };
}

function mapSchedule(items) {
  return items.slice(0, 12).map((item) => ({
    id: item.id,
    time: formatTime(item.scheduledAt),
    title: item.title,
    subtitle: item.detail,
    vehicleLabel: item.vehicleLabel,
    bay: item.bay,
    status: item.status,
  }));
}

function pickAssignment(items, staffMember) {
  const active =
    items.find((i) => i.urgency === "in_progress") ||
    items.find((i) => i.urgency === "urgent") ||
    items[0];

  if (!active) return null;

  return {
    bay: active.bay || "Unassigned",
    area: staffMember.jobTitle || "Operations",
    vehicleLabel: active.vehicleLabel,
    taskTitle: active.title,
    status: active.urgency === "in_progress" ? "active" : "scheduled",
    scheduledAt: active.scheduledAt,
    sourceType: active.sourceType,
    sourceId: active.sourceId,
  };
}

exports.getOverview = async (staffMemberId) => {
  const staffMember = await repository.loadStaffMember(staffMemberId);
  if (!staffMember) throw new AppError("Staff member not found", 404);

  const roleName = String(staffMember.role?.name || "").toLowerCase();
  if (!["staff", "admin"].includes(roleName)) {
    throw new AppError("Staff access required", 403);
  }

  const [
    membersInClub,
    membersJoinedYesterday,
    vehiclesStored,
    pendingIntake,
    openRequests,
    criticalRequests,
    occupiedBays,
    inspectionsPending,
    photosPending,
    confirmationsPending,
    conciergeUnread,
    staffOnDuty,
    vehiclesForAlerts,
    todayItems,
    shiftStats,
  ] = await Promise.all([
    repository.countMembersInClub(),
    repository.getMembersJoinedSinceYesterday(),
    repository.countVehiclesStored(),
    repository.countPendingIntake(),
    repository.countOpenRequests(),
    repository.countCriticalOpenRequests(),
    repository.countOccupiedBays(),
    repository.countInspectionsPending(),
    repository.countPhotoUploadsPending(),
    repository.countConfirmationsPending(),
    repository.sumConciergeUnread(),
    repository.listStaffOnDuty(),
    repository.listVehiclesForAlerts(),
    repository.listTodayWorkItems(),
    repository.getShiftStatsForToday(staffMemberId),
  ]);

  const totalBays = repository.getStorageTotalBays();
  const availableBays = Math.max(0, totalBays - occupiedBays);
  const occupancyPercent = totalBays
    ? Math.min(100, Math.round((occupiedBays / totalBays) * 100))
    : 0;

  const priorityTasks = mapPriorityTasks(todayItems);
  const systemAlerts = mapHealthAlerts(vehiclesForAlerts);
  const shift = resolveShift();

  return {
    staff: {
      id: staffMember.id,
      name: displayName(staffMember),
      role: roleName,
      jobTitle: staffMember.jobTitle || (roleName === "admin" ? "Administrator" : "Operative"),
      status: "active",
      profileImageUrl: staffMember.profileImageUrl || null,
    },
    shift,
    kpis: {
      membersInClub: {
        value: membersInClub,
        changeSinceYesterday: membersJoinedYesterday,
      },
      vehiclesStored: {
        value: vehiclesStored,
        pendingIntake,
      },
      openRequests: {
        value: openRequests,
        critical: criticalRequests,
      },
      storageOccupancy: {
        percent: occupancyPercent,
        occupiedBays,
        availableBays,
        totalBays,
      },
    },
    quickActions: [
      { key: "inspections", label: "Inspections", pendingCount: inspectionsPending, path: "/staff/inspections" },
      { key: "photo_uploads", label: "Photo Uploads", pendingCount: photosPending, path: "/staff/photo-uploads" },
      { key: "concierge", label: "Concierge", pendingCount: conciergeUnread, path: "/staff/concierge" },
      { key: "confirmations", label: "Confirmations", pendingCount: confirmationsPending, path: "/staff/confirmations" },
    ],
    priorityTasks,
    schedule: {
      date: shift.displayDate,
      items: mapSchedule(todayItems),
    },
    systemAlerts: {
      criticalCount: systemAlerts.filter((a) => a.severity === "critical").length,
      items: systemAlerts,
    },
    staffOnDuty: staffOnDuty.map((m) => ({
      id: m.id,
      name: displayName(m),
      role: m.jobTitle || m.role?.name || "staff",
      status: "active",
      profileImageUrl: m.profileImageUrl || null,
    })),
    shiftStats: {
      tasksCompleted: shiftStats.tasksCompleted,
      tasksTotal: shiftStats.tasksTotal,
      vehiclesMoved: shiftStats.vehiclesMoved,
      inspectionsDone: shiftStats.inspectionsDone,
      serviceConfirmations: shiftStats.serviceConfirmations,
      incidentsLogged: shiftStats.incidentsLogged,
      photosUploaded: shiftStats.photosUploaded,
    },
    yourAssignment: pickAssignment(priorityTasks.items, staffMember),
  };
};
