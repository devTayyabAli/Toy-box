const Joi = require("joi");

const CATEGORY_VALUES = ["drives", "auctions", "dining", "track"];
const ACCESS_VALUES = ["open", "invite_only", "byo_car"];

const eventBody = {
  title: Joi.string().min(1).max(200).required(),
  category: Joi.string().valid(...CATEGORY_VALUES).required(),
  description: Joi.string().allow("", null).max(5000),
  location: Joi.string().allow("", null).max(255),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().allow(null),
  isAllDay: Joi.boolean(),
  imageUrl: Joi.string().allow("", null).max(2048),
  isFeatured: Joi.boolean(),
  capacity: Joi.number().integer().min(1).allow(null),
  accessType: Joi.string().valid(...ACCESS_VALUES),
};

exports.createEventSchema = Joi.object(eventBody);

exports.updateEventSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  category: Joi.string().valid(...CATEGORY_VALUES),
  description: Joi.string().allow("", null).max(5000),
  location: Joi.string().allow("", null).max(255),
  startsAt: Joi.date().iso(),
  endsAt: Joi.date().iso().allow(null),
  isAllDay: Joi.boolean(),
  imageUrl: Joi.string().allow("", null).max(2048),
  isFeatured: Joi.boolean(),
  capacity: Joi.number().integer().min(1).allow(null),
  accessType: Joi.string().valid(...ACCESS_VALUES),
})
  .min(1)
  .unknown(false);

exports.eventIdParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
});

exports.rsvpBodySchema = Joi.object({
  memberId: Joi.number().integer().min(1).required(),
  isFavorite: Joi.boolean(),
});

exports.joinBodySchema = Joi.object({
  isFavorite: Joi.boolean().default(false),
});

exports.patchRsvpBodySchema = Joi.object({
  memberId: Joi.number().integer().min(1).required(),
  isFavorite: Joi.boolean().required(),
}).unknown(false);

exports.memberDiaryParamSchema = Joi.object({
  memberId: Joi.number().integer().min(1).required(),
});

exports.listQuerySchema = Joi.object({
  category: Joi.string().valid("all", "drives", "auctions", "dining", "track").allow("", null),
  isFeatured: Joi.string().valid("true", "false", "1", "0").allow("", null),
  q: Joi.string().max(200).allow("", null),
  grouped: Joi.string().valid("true", "false", "1", "0").allow("", null),
  memberId: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  offset: Joi.number().integer().min(0),
  refDate: Joi.date().iso(),
}).unknown(false);

exports.diaryQuerySchema = exports.listQuerySchema;
