const { PaymentTransaction } = require("../../models");

exports.create = (data) => PaymentTransaction.create(data);

exports.findBySessionId = (stripeSessionId) =>
  PaymentTransaction.findOne({ where: { stripeSessionId } });

exports.updateBySessionId = async (stripeSessionId, patch) => {
  const row = await exports.findBySessionId(stripeSessionId);
  if (!row) return null;
  await row.update(patch);
  return row;
};
