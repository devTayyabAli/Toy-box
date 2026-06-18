const { Vehicle } = require("../../models");

const VEHICLE_TYPE_TABS = [
  { key: "cars", value: "car", label: "Cars" },
  { key: "bikes", value: "bike", label: "Bikes" },
  { key: "other", value: "other", label: "Other" },
];

/** Figma garage tabs: All | Ready | In Service | Stored | In Review */
const GARAGE_STATUS_TABS = [
  { key: "all", label: "All", statuses: null },
  { key: "ready", label: "Ready", statuses: ["Available", "Ready"] },
  { key: "in_service", label: "In Service", statuses: ["In Service", "In Progress", "Service in progress"] },
  { key: "stored", label: "Stored", statuses: ["Stored", "In storage"] },
  { key: "in_review", label: "In Review", statuses: ["In review", "In Review"] },
];

const GARAGE_STATUS_MAP = Object.fromEntries(
  GARAGE_STATUS_TABS.filter((t) => t.statuses).flatMap((t) =>
    t.statuses.map((s) => [s, t.key]),
  ),
);

/** Short labels on garage list cards (Figma) */
const GARAGE_STATUS_UI_LABELS = {
  ready: "Ready",
  in_service: "Service",
  stored: "Stored",
  in_review: "In Review",
};

/** Featured vehicle action row on My Garage */
const GARAGE_OVERVIEW_QUICK_ACTIONS = [
  { key: "details", label: "DETAILS" },
  { key: "request", label: "REQUEST" },
  { key: "health", label: "HEALTH" },
  { key: "docs", label: "DOCS" },
];

const REQUEST_TYPES = [
  "transport_delivery",
  "detailing_wash",
  "maintenance_service",
  "vehicle_source_assistance",
  "vehicle_booking",
];

const REQUEST_TYPE_LABELS = {
  transport_delivery: "Transport",
  detailing_wash: "Detailing & Cleaning",
  maintenance_service: "Maintenance & Repair",
  vehicle_source_assistance: "vehicle_source Assistance",
  vehicle_booking: "Other Services",
};

const ACTIVE_REQUEST_STATUSES = [
  "Requested",
  "Accepted",
  "In Progress",
  "Upcoming",
  "Request sent",
  "Vehicle picked up",
  "Service in progress",
  "Awaiting approval",
  "Ready for delivery",
  "Awaiting confirmation",
  "Confirmed",
  "In transit",
  "Scheduled",
  "Searching for vehicle",
];

const PAST_REQUEST_STATUSES = ["Completed", "Cancelled"];

const REQUEST_STATUSES = [
  "Requested",
  "Accepted",
  "In Progress",
  "Upcoming",
  "Completed",
  "Cancelled",
];

const SERVICE_REQUEST_OPTIONS = [
  {
    key: "maintenance_repair",
    type: "maintenance_service",
    label: "Maintenance & Repair",
    description: "Scheduled service, repairs, and workshop visits.",
    apiPath: "/api/v1/maintenance/requests",
  },
  {
    key: "vehicle_source_assistance",
    type: "vehicle_source_assistance",
    label: "vehicle_source Assistance",
    description: "Urgent breakdown, flat tyre, or recovery support.",
    apiPath: "/api/v1/vehicles/requests",
  },
  {
    key: "detailing_cleaning",
    type: "detailing_wash",
    label: "Detailing & Cleaning",
    description: "Wash, detail, and cosmetic care for your vehicle.",
    apiPath: "/api/v1/detailing/bookings",
  },
  {
    key: "other_services",
    type: "vehicle_booking",
    label: "Other Services",
    description: "Valet, transport, and bespoke concierge requests.",
    apiPath: "/api/v1/vehicles/requests",
  },
];

const QUICK_ACTIONS = [
  { key: "transport", type: "transport_delivery", label: "Transport" },
  { key: "detailing", type: "detailing_wash", label: "Detailing" },
  { key: "service", type: "maintenance_service", label: "Service" },
  { key: "vehicle_source", type: "vehicle_source_assistance", label: "vehicle_source" },
];

const DOCUMENT_SECTIONS = [
  {
    key: "registration_legal",
    title: "Registration and Legal",
    items: [
      { key: "vehicleRegistration", label: "Vehicle Registration" },
      { key: "insuranceCertificate", label: "Insurance Certificate" },
    ],
  },
  {
    key: "service_history",
    title: "Service History",
    items: [
      { key: "serviceRecord", label: "Service Records" },
      { key: "specsAndInfo", label: "Maintenance Log" },
    ],
  },
  {
    key: "warranty_insurance",
    title: "Warranty and Insurance",
    items: [
      { key: "warrantyCertificate", label: "Warranty Card" },
      { key: "purchasedInvoice", label: "Insurance Policy" },
    ],
  },
];

const HEALTH_LABELS = {
  engine_drivetrain: "Engine & Drivetrain",
  engine_performance: "Engine Performance",
  transmission: "Transmission",
  braking_system: "Braking System",
  suspension: "Suspension",
  electrical_system: "Electrical System",
  battery_health: "Battery Health",
  tyres: "Tyres",
  brakes: "Brakes",
  fluids: "Fluids",
  battery: "Battery",
  exterior_body: "Exterior & Body",
};

const DEFAULT_FULL_HEALTH_REPORT = [
  { category: "engine_performance", percentage: 85 },
  { category: "transmission", percentage: 90 },
  { category: "braking_system", percentage: 88 },
  { category: "suspension", percentage: 82 },
  { category: "electrical_system", percentage: 91 },
  { category: "battery_health", percentage: 78 },
];

module.exports = {
  VEHICLE_TYPE_TABS,
  GARAGE_STATUS_TABS,
  GARAGE_STATUS_MAP,
  GARAGE_STATUS_UI_LABELS,
  GARAGE_OVERVIEW_QUICK_ACTIONS,
  VEHICLE_TYPES: Vehicle.VEHICLE_TYPES,
  REQUEST_TYPES,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUSES,
  ACTIVE_REQUEST_STATUSES,
  PAST_REQUEST_STATUSES,
  SERVICE_REQUEST_OPTIONS,
  QUICK_ACTIONS,
  DOCUMENT_SECTIONS,
  HEALTH_LABELS,
  DEFAULT_FULL_HEALTH_REPORT,
};
