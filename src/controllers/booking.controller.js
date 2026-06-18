const BookingService = require("../services/booking.service");
const Response = require("../helpers/response.helper");

class BookingController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    const result = await this.service.processCreate(req.body);
    return Response.success(res, "Booking created successfully.", result, 201);
  }

  async list(req, res) {
    const result = await this.service.processList();
    return Response.success(res, "Bookings fetched successfully.", result);
  }

  async getById(req, res) {
    const result = await this.service.processGetById(req.params.id);
    return Response.success(res, "Booking fetched successfully.", result);
  }

  async update(req, res) {
    const result = await this.service.processUpdate(req.params.id, req.body);
    return Response.success(res, "Booking updated successfully.", result);
  }

  async remove(req, res) {
    const result = await this.service.processDelete(req.params.id);
    return Response.success(res, "Booking deleted successfully.", result);
  }
}

module.exports = new BookingController(BookingService);
