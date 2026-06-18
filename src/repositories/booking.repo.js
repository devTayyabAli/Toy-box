const Booking = require("../legacy/models/booking.model");

class BookingRepository {
  constructor(model) {
    this.model = model;
  }

  async find(where = {}) {
    return await this.model
      .find(where)
      .populate("customer")
      .populate("vehicle")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await this.model.findById(id).populate("customer").populate("vehicle");
  }

  async createBooking(payload) {
    return await this.model.create(payload);
  }

  async updateById(id, payload) {
    return await this.model
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      })
      .populate("customer")
      .populate("vehicle");
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async findOverlapping(vehicleId, pickupDate, returnDate, excludeId = null) {
    const query = {
      vehicle: vehicleId,
      status: { $in: ["booked", "ongoing"] },
      pickupDate: { $lte: returnDate },
      returnDate: { $gte: pickupDate },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await this.model.findOne(query);
  }
}

module.exports = new BookingRepository(Booking);
