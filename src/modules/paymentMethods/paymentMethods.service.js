const AppError = require("../../utils/AppError");
const { Member } = require("../../models");
const paymentMethodsRepository = require("./paymentMethods.repository");

function format(row) {
  const r = row.get ? row.get({ plain: true }) : row;
  return {
    id: r.id,
    memberId: r.memberId,
    label: r.label,
    brand: r.brand,
    last4: r.last4,
    expiryMonth: r.expiryMonth,
    expiryYear: r.expiryYear,
    isDefault: r.isDefault,
  };
}

exports.list = async (memberId) => {
  const rows = await paymentMethodsRepository.findByMember(memberId);
  return { paymentMethods: rows.map(format) };
};

exports.create = async (body) => {
  const member = await Member.findByPk(body.memberId);
  if (!member) throw new AppError("Member not found", 404);

  if (body.isDefault) {
    await paymentMethodsRepository.clearDefault(body.memberId);
  }

  const row = await paymentMethodsRepository.create({
    memberId: body.memberId,
    label: body.label,
    brand: body.brand || null,
    last4: body.last4 || null,
    expiryMonth: body.expiryMonth || null,
    expiryYear: body.expiryYear || null,
    isDefault: Boolean(body.isDefault),
  });

  const all = await paymentMethodsRepository.findByMember(body.memberId);
  if (all.length === 1) {
    await row.update({ isDefault: true });
  }

  return format(await paymentMethodsRepository.findById(row.id));
};

exports.setDefault = async (id, memberId) => {
  const row = await paymentMethodsRepository.findById(id);
  if (!row || row.memberId !== memberId) {
    throw new AppError("Payment method not found", 404);
  }
  await paymentMethodsRepository.clearDefault(memberId);
  await row.update({ isDefault: true });
  return format(row);
};

exports.remove = async (id, memberId) => {
  const row = await paymentMethodsRepository.findById(id);
  if (!row || row.memberId !== memberId) {
    throw new AppError("Payment method not found", 404);
  }
  const wasDefault = row.isDefault;
  await paymentMethodsRepository.destroy(id);
  if (wasDefault) {
    const remaining = await paymentMethodsRepository.findByMember(memberId);
    if (remaining[0]) await remaining[0].update({ isDefault: true });
  }
  return { id: Number(id), deleted: true };
};
