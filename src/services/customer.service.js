const CustomerRepository = require("../repositories/customer.repo");
const AppError = require("../utils/AppError");

class CustomerService {
  constructor(repo) {
    this.repo = repo;
  }

  async processCreate(payload) {
    const created = await this.repo.createCustomer(payload);
    return { customer: created };
  }

  async processList() {
    const customers = await this.repo.find({ isActive: true });
    return { customers };
  }

  async processGetById(id) {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new AppError("Customer not found.", 404);
    }
    return { customer };
  }

  async processUpdate(id, payload) {
    const customer = await this.repo.updateById(id, payload);
    if (!customer) {
      throw new AppError("Customer not found.", 404);
    }
    return { customer };
  }

  async processDelete(id) {
    const customer = await this.repo.deleteById(id);
    if (!customer) {
      throw new AppError("Customer not found.", 404);
    }
    return { customer };
  }
}

module.exports = new CustomerService(CustomerRepository);
