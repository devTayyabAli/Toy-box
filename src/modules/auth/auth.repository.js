const { Member, Role } = require("../../models");

exports.findByEmail = (email, { withPassword = false } = {}) => {
  const include = [{ model: Role, as: "role", attributes: ["id", "name"] }];
  const where = { email };
  if (withPassword) {
    return Member.unscoped().findOne({ where, include });
  }
  return Member.findOne({ where, include });
};

exports.findByPk = (id) =>
  Member.findByPk(id, {
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
  });

exports.findByHandle = (displayHandle) =>
  Member.findOne({ where: { displayHandle }, attributes: ["id"] });

exports.createMember = (data) => Member.create(data);

exports.findRoleByName = (name) => Role.findOne({ where: { name } });

exports.findUnscopedByPk = (id) =>
  Member.unscoped().findByPk(id, {
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
  });
