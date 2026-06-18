const { PaymentMethod } = require("../../models");

exports.findByMember = (memberId) =>
  PaymentMethod.findAll({
    where: { memberId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

exports.findById = (id) => PaymentMethod.findByPk(id);

exports.findByStripeId = (stripePaymentMethodId) =>
  PaymentMethod.findOne({ where: { stripePaymentMethodId } });

exports.create = (data) => PaymentMethod.create(data);

exports.update = async (id, data) => {
  const row = await PaymentMethod.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

exports.destroy = async (id) => {
  const row = await PaymentMethod.findByPk(id);
  if (!row) return null;
  await row.destroy();
  return row;
};

exports.clearDefault = (memberId) =>
  PaymentMethod.update({ isDefault: false }, { where: { memberId } });
