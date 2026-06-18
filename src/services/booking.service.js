const BookingRepository = require("../repositories/booking.repo");
const VehicleRepository = require("../repositories/vehicle.repo");
const AppError = require("../utils/AppError");

class BookingService {
  constructor(repo, vehicleRepo) {
    this.repo = repo;
    this.vehicleRepo = vehicleRepo;
  }

  _getBookingDurationDays(pickupDate, returnDate) {
    const oneDay = 1000 * 60 * 60 * 24;
    const start = new Date(pickupDate).setHours(0, 0, 0, 0);
    const end = new Date(returnDate).setHours(0, 0, 0, 0);
    const days = Math.floor((end - start) / oneDay) + 1;
    return days > 0 ? days : 0;
  }

  _validateDates(pickupDate, returnDate) {
    const pickup = new Date(pickupDate);
    const returned = new Date(returnDate);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returned.getTime())) {
      throw new AppError("Invalid booking dates.", 400);
    }
    if (returned < pickup) {
      throw new AppError("Return date must be greater than pickup date.", 400);
    }
  }

  async processCreate(payload) {
    this._validateDates(payload.pickupDate, payload.returnDate);

    const vehicle = await this.vehicleRepo.findById(payload.vehicle);
    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404);
    }

    const overlap = await this.repo.findOverlapping(
      payload.vehicle,
      payload.pickupDate,
      payload.returnDate,
    );
    if (overlap) {
      throw new AppError("Vehicle already booked in selected date range.", 409);
    }

    const totalDays = this._getBookingDurationDays(
      payload.pickupDate,
      payload.returnDate,
    );
    const rentPerDay = vehicle.rentPerDay;
    const totalAmount = totalDays * rentPerDay;

    const booking = await this.repo.createBooking({
      ...payload,
      totalDays,
      rentPerDay,
      totalAmount,
    });

    const created = await this.repo.findById(booking._id);
    return { booking: created };
  }

  async processList() {
    const bookings = await this.repo.find();
    return { bookings };
  }

  async processGetById(id) {
    const booking = await this.repo.findById(id);
    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }
    return { booking };
  }

  async processUpdate(id, payload) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError("Booking not found.", 404);
    }

    const nextVehicleId =
      payload.vehicle || existing.vehicle?._id?.toString() || existing.vehicle;
    const nextPickupDate = payload.pickupDate || existing.pickupDate;
    const nextReturnDate = payload.returnDate || existing.returnDate;

    this._validateDates(nextPickupDate, nextReturnDate);

    const overlap = await this.repo.findOverlapping(
      nextVehicleId,
      nextPickupDate,
      nextReturnDate,
      id,
    );
    if (overlap) {
      throw new AppError("Vehicle already booked in selected date range.", 409);
    }

    const vehicle = await this.vehicleRepo.findById(nextVehicleId);
    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404);
    }

    const totalDays = this._getBookingDurationDays(nextPickupDate, nextReturnDate);
    const rentPerDay = vehicle.rentPerDay;
    const totalAmount = totalDays * rentPerDay;

    const booking = await this.repo.updateById(id, {
      ...payload,
      vehicle: nextVehicleId,
      pickupDate: nextPickupDate,
      returnDate: nextReturnDate,
      totalDays,
      rentPerDay,
      totalAmount,
    });

    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }

    return { booking };
  }

  async processDelete(id) {
    const booking = await this.repo.deleteById(id);
    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }
    return { booking };
  }
}

module.exports = new BookingService(BookingRepository, VehicleRepository);
