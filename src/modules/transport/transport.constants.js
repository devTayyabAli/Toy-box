const TRANSPORT_SERVICE_TYPES = {
  pickup_from_storage: {
    key: "pickup_from_storage",
    label: "Pickup from storage",
    description: "We deliver to your location",
  },
  return_to_storage: {
    key: "return_to_storage",
    label: "Return to storage",
    description: "We collect from your location",
  },
  custom_transfer: {
    key: "custom_transfer",
    label: "Custom transfer",
    description: "Between two locations",
  },
  transport_delivery: {
    key: "transport_delivery",
    label: "Transport delivery",
    description: "Vehicle delivery to your location",
  },
};

const TRANSPORT_SERVICE_TYPE_KEYS = Object.keys(TRANSPORT_SERVICE_TYPES);

const DEFAULT_STORAGE_LOCATION =
  process.env.TOYBOX_STORAGE_LOCATION || "Toy-Box Storage Facility";

const INITIAL_STATUS = "Awaiting confirmation";

module.exports = {
  TRANSPORT_SERVICE_TYPES,
  TRANSPORT_SERVICE_TYPE_KEYS,
  DEFAULT_STORAGE_LOCATION,
  INITIAL_STATUS,
};
