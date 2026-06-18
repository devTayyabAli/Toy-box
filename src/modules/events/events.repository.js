const { Event, EventRsvp, sequelize } = require("../../models");
const { Op } = require("sequelize");

const attendingLiteral = sequelize.literal(
  `(SELECT COUNT(*)::int FROM "EventRsvps" AS er WHERE er."eventId" = "Event"."id" AND er."status" = 'confirmed')`,
);

function withAttendingCount(options = {}) {
  return {
    ...options,
    attributes: {
      ...(options.attributes || {}),
      include: [...(options.attributes?.include || []), [attendingLiteral, "attendingCount"]],
    },
  };
}

exports.findAllWithRsvpCounts = (options = {}) => Event.findAll(withAttendingCount(options));

exports.findByPkWithRsvpCount = (id) => Event.findByPk(id, withAttendingCount());

exports.create = (data) => Event.create(data);

exports.updateByPk = async (id, data) => {
  const row = await Event.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findByPkWithRsvpCount(id);
};

exports.destroyByPk = async (id) => {
  const row = await Event.findByPk(id);
  if (!row) return false;
  await row.destroy();
  return true;
};

exports.countConfirmedRsvps = (eventId) =>
  EventRsvp.count({ where: { eventId, status: "confirmed" } });

exports.findRsvp = (eventId, memberId) =>
  EventRsvp.findOne({ where: { eventId, memberId, status: "confirmed" } });

exports.createRsvp = (eventId, memberId, { isFavorite = false } = {}) =>
  EventRsvp.create({ eventId, memberId, status: "confirmed", isFavorite: !!isFavorite });

exports.findEventsForMemberDiary = (memberId, where = {}, listOptions = {}) =>
  Event.findAll(
    withAttendingCount({
      where,
      include: [
        {
          model: EventRsvp,
          as: "rsvps",
          where: { memberId, status: "confirmed" },
          required: true,
          attributes: ["id", "isFavorite", "createdAt", "updatedAt"],
        },
      ],
      order: listOptions.order || [["startsAt", "ASC"]],
      limit: listOptions.limit,
      offset: listOptions.offset,
      subQuery: false,
    }),
  );

exports.countEventsForMemberDiary = (memberId, where = {}) =>
  Event.count({
    where,
    include: [
      {
        model: EventRsvp,
        as: "rsvps",
        where: { memberId, status: "confirmed" },
        required: true,
      },
    ],
    distinct: true,
    col: "Event.id",
  });

exports.updateRsvpFavorite = async (eventId, memberId, isFavorite) => {
  const row = await EventRsvp.findOne({
    where: { eventId, memberId, status: "confirmed" },
  });
  if (!row) return null;
  row.isFavorite = !!isFavorite;
  await row.save();
  return row;
};

exports.destroyRsvp = async (eventId, memberId) => {
  const n = await EventRsvp.destroy({ where: { eventId, memberId } });
  return n > 0;
};

exports.findRsvpsForMember = (memberId, eventIds = []) => {
  if (!eventIds.length) return Promise.resolve([]);
  return EventRsvp.findAll({
    where: {
      memberId,
      status: "confirmed",
      eventId: { [Op.in]: eventIds },
    },
    attributes: ["id", "eventId", "isFavorite", "createdAt"],
  });
};
