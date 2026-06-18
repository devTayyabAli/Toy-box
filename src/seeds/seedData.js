const Booking = require("../legacy/models/booking.model");
const Customer = require("../legacy/models/customer.model");
const Vehicle = require("../legacy/models/vehical.model");
const logger = require("../utils/logger");

const customersSeed = [
  {
    name: "Ali Raza",
    phone: "03001234567",
    email: "ali.raza@example.com",
    cnic: "35202-1234567-1",
    address: "Johar Town, Lahore",
    isActive: true,
  },
  {
    name: "Sara Khan",
    phone: "03111234567",
    email: "sara.khan@example.com",
    cnic: "35202-7654321-2",
    address: "DHA Phase 6, Lahore",
    isActive: true,
  },
  {
    name: "Usman Tariq",
    phone: "03221234567",
    email: "usman.tariq@example.com",
    cnic: "35201-5556667-3",
    address: "Gulberg, Lahore",
    isActive: true,
  },
];

const vehiclesSeed = [
  {
    name: "Toyota",
    model: "Corolla Altis",
    registrationNumber: "LEA-1234",
    rentPerDay: 6500,
    status: "available",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 5,
    isActive: true,
  },
  {
    name: "Honda",
    model: "Civic Oriel",
    registrationNumber: "LEB-5678",
    rentPerDay: 8000,
    status: "available",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 5,
    isActive: true,
  },
  {
    name: "Suzuki",
    model: "WagonR VXL",
    registrationNumber: "LEC-9012",
    rentPerDay: 4500,
    status: "available",
    fuelType: "petrol",
    transmission: "manual",
    seatingCapacity: 5,
    isActive: true,
  },
];

const bookingsSeed = [
  {
    customerPhone: "03001234567",
    vehicleRegistrationNumber: "LEA-1234",
    pickupDate: "2026-03-01T00:00:00.000Z",
    returnDate: "2026-03-03T00:00:00.000Z",
    status: "completed",
    paymentStatus: "paid",
    notes: "seed-booking-1",
  },
  {
    customerPhone: "03111234567",
    vehicleRegistrationNumber: "LEB-5678",
    pickupDate: "2026-03-10T00:00:00.000Z",
    returnDate: "2026-03-12T00:00:00.000Z",
    status: "completed",
    paymentStatus: "paid",
    notes: "seed-booking-2",
  },
  {
    customerPhone: "03221234567",
    vehicleRegistrationNumber: "LEC-9012",
    pickupDate: "2026-03-20T00:00:00.000Z",
    returnDate: "2026-03-22T00:00:00.000Z",
    status: "booked",
    paymentStatus: "pending",
    notes: "seed-booking-3",
  },
];

function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function getShouldSeedOnStartup() {
  const explicit = toBool(process.env.SEED_ON_STARTUP);
  if (explicit !== null) return explicit;
  return process.env.NODE_ENV !== "production";
}

function calculateTotalDays(pickupDate, returnDate) {
  const oneDay = 1000 * 60 * 60 * 24;
  const start = new Date(pickupDate).setHours(0, 0, 0, 0);
  const end = new Date(returnDate).setHours(0, 0, 0, 0);
  const days = Math.floor((end - start) / oneDay) + 1;
  return days > 0 ? days : 0;
}

async function upsertCustomers() {
  await Promise.all(
    customersSeed.map((customer) =>
      Customer.findOneAndUpdate(
        { phone: customer.phone },
        { $setOnInsert: customer },
        { upsert: true, new: true, runValidators: true },
      ),
    ),
  );
}

async function upsertVehicles() {
  await Promise.all(
    vehiclesSeed.map((vehicle) =>
      Vehicle.findOneAndUpdate(
        { registrationNumber: vehicle.registrationNumber },
        { $setOnInsert: vehicle },
        { upsert: true, new: true, runValidators: true },
      ),
    ),
  );
}

async function upsertBookings() {
  for (const booking of bookingsSeed) {
    const customer = await Customer.findOne({ phone: booking.customerPhone });
    const vehicle = await Vehicle.findOne({
      registrationNumber: booking.vehicleRegistrationNumber,
    });

    if (!customer || !vehicle) {
      logger.warning(
        `Skipping seed booking ${booking.notes} due to missing customer/vehicle`,
      );
      continue;
    }

    const totalDays = calculateTotalDays(booking.pickupDate, booking.returnDate);
    const rentPerDay = vehicle.rentPerDay;
    const totalAmount = totalDays * rentPerDay;

    await Booking.findOneAndUpdate(
      { notes: booking.notes },
      {
        $setOnInsert: {
          customer: customer._id,
          vehicle: vehicle._id,
          pickupDate: booking.pickupDate,
          returnDate: booking.returnDate,
          totalDays,
          rentPerDay,
          totalAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          notes: booking.notes,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
  }
}

async function seedInitialData(options = {}) {
  const shouldSeed =
    typeof options.enableOnStartup === "boolean"
      ? options.enableOnStartup
      : getShouldSeedOnStartup();

  if (!shouldSeed) {
    logger.info("Initial seeding is disabled.");
    return;
  }

  await upsertCustomers();
  await upsertVehicles();
  await upsertBookings();

  logger.info("Initial seed complete for customers, vehicles and bookings.");
}

module.exports = {
  seedInitialData,
};
