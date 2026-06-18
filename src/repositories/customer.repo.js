const Customer = require("../legacy/models/customer.model");

class CustomerRepository {
  constructor(model) {
    this.model = model;
  }

  async find(where = {}) {
    return await this.model.find(where).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async createCustomer(payload) {
    return await this.model.create(payload);
  }

  async updateById(id, payload) {
    return await this.model.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = new CustomerRepository(Customer);
