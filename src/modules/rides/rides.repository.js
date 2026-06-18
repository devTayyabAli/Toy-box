const { Vehicle } = require("../../models");

exports.findAll = () =>
  Vehicle.findAll({
    order: [["createdAt", "DESC"]],
  });

exports.findById = (id) => Vehicle.findByPk(id);

exports.create = (data) => Vehicle.create(data);

exports.updateById = async (id, data) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    return null;
  }
  await vehicle.update(data);
  return vehicle;
};

exports.deleteById = async (id) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    return null;
  }
  await vehicle.destroy();
  return vehicle;
};
