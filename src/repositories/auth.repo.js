const Admin = require("../legacy/models/admin.model");
class AuthRepository {
  constructor(model) {
    this.model = model;
  }
  async findOne(where) {
    return await this.model.findOne(where);
  }
  async findById(id) {
    return await this.model.findById(id);
  }
  async createAdmin(payload) {
    return await this.model.create(payload);
  }
}
module.exports = new AuthRepository(Admin);
