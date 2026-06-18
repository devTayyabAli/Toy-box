const CustomerService = require("../services/customer.service");
const Response = require("../helpers/response.helper");

class CustomerController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    const result = await this.service.processCreate(req.body);
    return Response.success(res, "Customer created successfully.", result, 201);
  }

  async list(req, res) {
    const result = await this.service.processList();
    return Response.success(res, "Customers fetched successfully.", result);
  }

  async getById(req, res) {
    const result = await this.service.processGetById(req.params.id);
    return Response.success(res, "Customer fetched successfully.", result);
  }

  async update(req, res) {
    const result = await this.service.processUpdate(req.params.id, req.body);
    return Response.success(res, "Customer updated successfully.", result);
  }

  async remove(req, res) {
    const result = await this.service.processDelete(req.params.id);
    return Response.success(res, "Customer deleted successfully.", result);
  }
}

module.exports = new CustomerController(CustomerService);
