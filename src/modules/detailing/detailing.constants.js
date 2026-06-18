const SERVICE_TYPE = "detailing_wash";

const INITIAL_STATUS = "Request Received";

const BOOKING_STATUSES = [
  INITIAL_STATUS,
  "Awaiting confirmation",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const PACKAGE_KEY_ALIASES = {
  signature_detail: "full_detail",
  exterior_only: "exterior_wash",
  exterior_detail: "exterior_wash",
  full_detail: "full_detail",
  interior_only: "interior_only",
  exterior_wash: "exterior_wash",
};

const SERVICE_LOCATIONS = [
  {
    key: "workshop_main",
    label: "Sheikh Zayed Road",
    address: "Sheikh Zayed Road — Toy-Box Workshop",
  },
  {
    key: "storage_facility",
    label: "Toy-Box Storage Facility",
    address: process.env.TOYBOX_STORAGE_LOCATION || "Toy-Box Storage Facility",
  },
];

const TIMELINE_STEPS = [
  { key: "booking_received", label: "Booking received" },
  { key: "confirmed_by_concierge", label: "Confirmed by workshop" },
  { key: "vehicle_prepared", label: "Vehicle picked & moved" },
  { key: "detailing_in_progress", label: "Detailing in progress" },
  { key: "ceramic_coat_application", label: "Ceramic coat application", optional: true },
  { key: "quality_check", label: "Quality check" },
  { key: "completed_returned", label: "Completed & ready for pick up" },
];

const DEFAULT_CONCIERGE = {
  name: "Sarah K.",
  role: "Concierge",
  avatarUrl: null,
};

module.exports = {
  SERVICE_TYPE,
  INITIAL_STATUS,
  BOOKING_STATUSES,
  PACKAGE_KEY_ALIASES,
  SERVICE_LOCATIONS,
  TIMELINE_STEPS,
  DEFAULT_CONCIERGE,
};
