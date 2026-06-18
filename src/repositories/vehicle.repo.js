const Vehicle = require("../legacy/models/vehical.model");

class VehicleRepository {
  constructor(model) {
    this.model = model;
  }

  async find(where = {}) {
    return await this.model.find(where).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async createVehicle(payload) {
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

module.exports = new VehicleRepository(Vehicle);
