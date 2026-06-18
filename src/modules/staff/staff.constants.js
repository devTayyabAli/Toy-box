"use strict";

const STORED_STATUSES = ["Stored", "In storage", "Available"];
const IN_SERVICE_STATUSES = ["In Service", "In Progress", "Service in progress", "In review", "In Review"];

const OPEN_REQUEST_STATUSES = {
  garage: ["Requested", "Accepted", "In Progress", "Upcoming"],
  maintenance: ["Request sent", "Vehicle picked up", "Service in progress", "Awaiting approval", "Ready for delivery"],
  transport: ["Awaiting confirmation", "Request sent", "In transit", "Scheduled", "Confirmed"],
  detailing: ["Request Received", "Awaiting confirmation", "Confirmed", "In Progress"],
  sourcing: ["Request received", "Searching for vehicle", "Vehicle found", "Inspection in progress", "Offer ready"],
};

const CONFIRMATION_STATUSES = ["Awaiting confirmation", "pending_member_approval"];

const HEALTH_ALERT_THRESHOLD = Number(process.env.STAFF_HEALTH_ALERT_PERCENT || 35);
const HEALTH_CRITICAL_THRESHOLD = Number(process.env.STAFF_HEALTH_CRITICAL_PERCENT || 25);
const STORAGE_TOTAL_BAYS = Number(process.env.STAFF_STORAGE_TOTAL_BAYS || 301);

const SHIFT_WINDOWS = [
  { key: "morning", label: "Morning Shift", startHour: 7, endHour: 15 },
  { key: "afternoon", label: "Afternoon Shift", startHour: 15, endHour: 23 },
  { key: "night", label: "Night Shift", startHour: 23, endHour: 7 },
];

module.exports = {
  STORED_STATUSES,
  IN_SERVICE_STATUSES,
  OPEN_REQUEST_STATUSES,
  CONFIRMATION_STATUSES,
  HEALTH_ALERT_THRESHOLD,
  HEALTH_CRITICAL_THRESHOLD,
  STORAGE_TOTAL_BAYS,
  SHIFT_WINDOWS,
};
