const { MaintenanceRequest, Vehicle, Member } = require("../../models");

const include = [
  { model: Vehicle, as: "vehicle" },
  { model: Member, as: "member", attributes: ["id", "name", "email"] },
];

exports.findById = (id) => MaintenanceRequest.findByPk(id, { include });

exports.findAll = (where = {}, limit = 50) =>
  MaintenanceRequest.findAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
    limit,
  });

exports.create = (data) => MaintenanceRequest.create(data);

exports.update = async (id, data) => {
  const row = await MaintenanceRequest.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findById(id);
};

exports.refExists = (referenceNumber) =>
  MaintenanceRequest.findOne({ where: { referenceNumber } });
