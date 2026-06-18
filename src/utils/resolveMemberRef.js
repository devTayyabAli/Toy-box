const { Op } = require("sequelize");
const { Member } = require("../models");
const AppError = require("./AppError");

/**
 * Resolve member reference from numeric id, padded id (00004), or memberNumber (0000002).
 * @param {string|number} ref — memberId or memberNumber from client
 * @returns {Promise<{ id: number, memberNumber: string|null }>}
 */
async function resolveMemberRef(ref) {
  if (ref === undefined || ref === null || String(ref).trim() === "") {
    throw new AppError("memberId is required", 400);
  }

  const raw = String(ref).trim();

  const byExactNumber = await Member.findOne({
    where: { memberNumber: raw },
    attributes: ["id", "memberNumber"],
  });
  if (byExactNumber) {
    return { id: byExactNumber.id, memberNumber: byExactNumber.memberNumber };
  }

  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) {
    throw new AppError(`Invalid memberId: ${raw}`, 400);
  }

  const numeric = parseInt(digitsOnly, 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new AppError(`Invalid memberId: ${raw}`, 400);
  }

  const byPk = await Member.findByPk(numeric, {
    attributes: ["id", "memberNumber"],
  });
  if (byPk) {
    return { id: byPk.id, memberNumber: byPk.memberNumber };
  }

  const candidates = [
    raw,
    digitsOnly,
    String(numeric),
    String(numeric).padStart(4, "0"),
    String(numeric).padStart(7, "0"),
  ];
  const unique = [...new Set(candidates.filter(Boolean))];

  const byNumber = await Member.findOne({
    where: { memberNumber: { [Op.in]: unique } },
    attributes: ["id", "memberNumber"],
  });
  if (byNumber) {
    return { id: byNumber.id, memberNumber: byNumber.memberNumber };
  }

  throw new AppError(`Member not found for id: ${raw}`, 404);
}

const Joi = require("joi");

/** Joi: integer id or string member number (00004, 0000002, …). */
const memberIdJoi = (required = true) => {
  const schema = Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().trim().min(1).max(32),
  );
  return required ? schema.required() : schema;
};

module.exports = {
  resolveMemberRef,
  memberIdJoi,
};
