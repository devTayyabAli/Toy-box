const { Op } = require("sequelize");
const AppError = require("../../utils/AppError");
const {
  Vehicle,
  Request,
  Booking,
  MaintenanceRequest,
  SourcingRequest,
  TransportRequest,
  Notification,
} = require("../../models");
const garageService = require("../garage/garage.service");
const garageRepository = require("../garage/garage.repository");
const eventsService = require("../events/events.service");
const { SERVICE_TYPE } = require("../detailing/detailing.constants");

const ACTIVE_STATUSES = {
  detailing: [
    "Request Received",
    "Awaiting confirmation",
    "Confirmed",
    "In Progress",
  ],
  maintenance: ["Request sent", "Vehicle picked up", "Service in progress", "Awaiting approval", "Ready for delivery"],
  transport: [
    "Awaiting confirmation",
    "Request sent",
    "In transit",
    "Scheduled",
    "Confirmed",
  ],
  sourcing: ["Request received", "Searching for vehicle", "Vehicle found", "Inspection in progress", "Offer ready"],
  request: ["Requested", "Accepted", "In Progress", "Upcoming"],
};

exports.getSummary = async (memberId) => {
  if (!memberId) {
    throw new AppError("memberId is required", 400);
  }

  const [
    vehicleCount,
    priorityCount,
    unreadNotifications,
    activeRequests,
    activeDetailing,
    activeMaintenance,
    activeTransport,
    activeSourcing,
  ] = await Promise.all([
    garageRepository.countMemberGarageVehicles(memberId),
    Vehicle.count({ where: { memberId, isPriority: true } }),
    Notification.count({ where: { memberId, isRead: false } }),
    Request.count({
      where: { memberId, status: { [Op.in]: ACTIVE_STATUSES.request } },
    }),
    Booking.count({
      where: { memberId, serviceType: SERVICE_TYPE, status: { [Op.in]: ACTIVE_STATUSES.detailing } },
    }),
    MaintenanceRequest.count({
      where: { memberId, status: { [Op.in]: ACTIVE_STATUSES.maintenance } },
    }),
    TransportRequest.count({
      where: { memberId, status: { [Op.in]: ACTIVE_STATUSES.transport } },
    }),
    SourcingRequest.count({
      where: { memberId, status: { [Op.in]: ACTIVE_STATUSES.sourcing } },
    }),
  ]);

  let garagePreview = { count: 0, vehicles: [] };
  let eventsPreview = { featured: [], thisWeek: [] };

  try {
    const garage = await garageService.listVehicles({ filter: "mine", memberId }, memberId);
    garagePreview = { count: garage.count, vehicles: garage.vehicles.slice(0, 3) };
  } catch {
    /* ignore */
  }

  try {
    const events = await eventsService.list({ grouped: "true", limit: 5 });
    eventsPreview = {
      featured: (events.featured || []).slice(0, 3),
      thisWeek: (events.thisWeek || []).slice(0, 3),
    };
  } catch {
    /* ignore */
  }

  const activeBookingsTotal =
    activeRequests + activeDetailing + activeMaintenance + activeTransport + activeSourcing;

  return {
    memberId,
    stats: {
      vehicles: vehicleCount,
      priorityVehicles: priorityCount,
      unreadNotifications,
      activeBookings: activeBookingsTotal,
      activeDetailing,
      activeMaintenance,
      activeTransport,
      activeSourcing,
      activeRequests,
    },
    garage: garagePreview,
    events: eventsPreview,
    quickActions: [
      { key: "garage", label: "My Garage", path: "/garage" },
      { key: "detailing", label: "Detailing & Wash", path: "/detailing" },
      { key: "maintenance", label: "Maintenance", path: "/maintenance" },
      { key: "transport", label: "Transport", path: "/transport" },
      { key: "sourcing", label: "Vehicle Sourcing", path: "/sourcing" },
    ],
  };
};
