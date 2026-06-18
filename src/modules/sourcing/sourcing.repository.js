const { SourcingRequest, Member } = require("../../models");

exports.findById = (id) =>
  SourcingRequest.findByPk(id, {
    include: [{ model: Member, as: "member", attributes: ["id", "name", "email"] }],
  });

exports.findAll = (where = {}, options = {}) => {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const include = options.include ?? [];

  return SourcingRequest.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include,
  });
};

exports.countAll = (where = {}) => SourcingRequest.count({ where });

exports.create = (data) => SourcingRequest.create(data);

exports.update = async (id, data) => {
  const row = await SourcingRequest.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findById(id);
};

exports.refExists = (referenceNumber) =>
  SourcingRequest.findOne({ where: { referenceNumber } });
