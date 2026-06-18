const { TransportRequest, Vehicle, Member } = require("../../models");

const include = [
  { model: Vehicle, as: "vehicle" },
  { model: Member, as: "member", attributes: ["id", "memberNumber", "name", "email"] },
];

exports.findById = (id) => TransportRequest.findByPk(id, { include });

exports.findAll = (where = {}, limit = 50) =>
  TransportRequest.findAll({ where, include, order: [["createdAt", "DESC"]], limit });

exports.create = (data) => TransportRequest.create(data);

exports.update = async (id, data) => {
  const row = await TransportRequest.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findById(id);
};

exports.refExists = (ref) => TransportRequest.findOne({ where: { referenceNumber: ref } });
