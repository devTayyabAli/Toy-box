const VehicleRepository = require("../repositories/vehicle.repo");
const AppError = require("../utils/AppError");

class VehicleService {
  constructor(repo) {
    this.repo = repo;
  }

  async processCreate(payload) {
    const vehicle = await this.repo.createVehicle(payload);
    return { vehicle };
  }

  async processList() {
    const vehicles = await this.repo.find({ isActive: true });
    return { vehicles };
  }

  async processGetById(id) {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404);
    }
    return { vehicle };
  }

  async processUpdate(id, payload) {
    const vehicle = await this.repo.updateById(id, payload);
    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404);
    }
    return { vehicle };
  }

  async processDelete(id) {
    const vehicle = await this.repo.deleteById(id);
    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404);
    }
    return { vehicle };
  }
}

module.exports = new VehicleService(VehicleRepository);
