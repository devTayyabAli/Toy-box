const { Op } = require("sequelize");
const eventsRepository = require("./events.repository");
const { Member, Event } = require("../../models");

const CATEGORIES = ["drives", "auctions", "dining", "track"];

function parseBool(v) {
  if (v === undefined || v === null || v === "") return undefined;
  if (v === true || v === "true" || v === "1") return true;
  if (v === false || v === "false" || v === "0") return false;
  return undefined;
}

function parseGrouped(v) {
  return v === true || v === "true" || v === "1";
}

function referenceDate(query) {
  if (query.refDate) {
    const d = new Date(query.refDate);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function startOfWeekMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function endOfWeekSunday(d) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfNextCalendarMonth(d) {
  const t = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

function endOfNextCalendarMonth(d) {
  const t = new Date(d.getFullYear(), d.getMonth() + 2, 0);
  t.setHours(23, 59, 59, 999);
  return t;
}

function validateCategoryToken(cat) {
  if (!cat || cat === "all") return;
  if (!CATEGORIES.includes(cat)) {
    const err = new Error(`Invalid category. Use: all, ${CATEGORIES.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

function buildCategorySearchWhere(query) {
  const where = {};
  const raw = query.category;
  const cat =
    raw != null && String(raw).trim() !== "" ? String(raw).toLowerCase().trim() : "all";
  validateCategoryToken(cat);
  if (cat && cat !== "all") where.category = cat;

  const q = query.q ? String(query.q).trim() : "";
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { location: { [Op.iLike]: `%${q}%` } },
    ];
  }
  return where;
}

function buildWhereFromQuery(query) {
  const where = buildCategorySearchWhere(query);
  const featured = parseBool(query.isFeatured);
  if (featured === true) where.isFeatured = true;
  if (featured === false) where.isFeatured = false;
  return where;
}

function formatMyRsvp(rsvpRow) {
  if (!rsvpRow) return null;
  const r = rsvpRow.get ? rsvpRow.get({ plain: true }) : rsvpRow;
  return {
    id: r.id,
    isFavorite: !!r.isFavorite,
    status: "going",
    joinedAt: r.createdAt,
  };
}

function mapEventPlain(plain, myRsvp = null) {
  const p = { ...plain };
  delete p.rsvps;
  const attending = Number(p.attendingCount) || 0;
  const cap = p.capacity;
  let spotsRemaining = null;
  if (cap != null && cap !== "") {
    const c = Number(cap);
    spotsRemaining = Number.isFinite(c) ? Math.max(0, c - attending) : null;
  }
  const joined = Boolean(myRsvp);
  return {
    ...p,
    attendingCount: attending,
    spotsRemaining,
    isJoined: joined,
    myRsvp: joined ? myRsvp : null,
  };
}

function mapEventRow(row, myRsvp = null) {
  const plain = row.get ? row.get({ plain: true }) : { ...row };
  return mapEventPlain(plain, myRsvp);
}

async function buildMyRsvpMap(memberId, eventRows) {
  if (!memberId || !eventRows?.length) return new Map();
  const ids = eventRows.map((r) => {
    const p = r.get ? r.get({ plain: true }) : r;
    return p.id;
  });
  const rsvps = await eventsRepository.findRsvpsForMember(memberId, ids);
  const map = new Map();
  for (const r of rsvps) {
    map.set(r.eventId, formatMyRsvp(r));
  }
  return map;
}

function resolveViewerMemberId(query, authUserId) {
  if (authUserId) return Number(authUserId);
  if (query?.memberId) return Number(query.memberId);
  return null;
}

function mapDiaryEventRow(row) {
  const plain = row.get({ plain: true });
  const my = Array.isArray(plain.rsvps) && plain.rsvps[0] ? plain.rsvps[0] : null;
  const base = mapEventPlain(plain);
  base.isJoined = Boolean(my);
  base.myRsvp = my
    ? {
        id: my.id,
        isFavorite: !!my.isFavorite,
        status: "going",
        joinedAt: my.createdAt,
      }
    : null;
  return base;
}

exports.list = async (query, viewerMemberId = null) => {
  const memberId = resolveViewerMemberId(query, viewerMemberId);
  const ref = referenceDate(query);
  if (parseGrouped(query.grouped)) {
    const weekStart = startOfWeekMonday(ref);
    const weekEnd = endOfWeekSunday(ref);
    const nextStart = startOfNextCalendarMonth(ref);
    const nextEnd = endOfNextCalendarMonth(ref);

    const base = buildCategorySearchWhere(query);

    const [featured, thisWeek, nextMonth] = await Promise.all([
      eventsRepository.findAllWithRsvpCounts({
        where: { ...base, isFeatured: true },
        order: [["startsAt", "ASC"]],
      }),
      eventsRepository.findAllWithRsvpCounts({
        where: {
          ...base,
          isFeatured: false,
          startsAt: { [Op.between]: [weekStart, weekEnd] },
        },
        order: [["startsAt", "ASC"]],
      }),
      eventsRepository.findAllWithRsvpCounts({
        where: {
          ...base,
          isFeatured: false,
          startsAt: { [Op.between]: [nextStart, nextEnd] },
        },
        order: [["startsAt", "ASC"]],
      }),
    ]);

    const allRows = [...featured, ...thisWeek, ...nextMonth];
    const rsvpMap = await buildMyRsvpMap(memberId, allRows);
    return {
      grouped: true,
      memberId: memberId || undefined,
      featured: featured.map((r) => mapEventRow(r, rsvpMap.get(r.id) || null)),
      thisWeek: thisWeek.map((r) => mapEventRow(r, rsvpMap.get(r.id) || null)),
      nextMonth: nextMonth.map((r) => mapEventRow(r, rsvpMap.get(r.id) || null)),
    };
  }

  const where = buildWhereFromQuery(query);
  const limit = Math.min(Number(query.limit) || 50, 100);
  const offset = Math.max(Number(query.offset) || 0, 0);

  const [total, rows] = await Promise.all([
    Event.count({ where }),
    eventsRepository.findAllWithRsvpCounts({
      where,
      order: [["startsAt", "ASC"]],
      limit,
      offset,
    }),
  ]);

  const rsvpMap = await buildMyRsvpMap(memberId, rows);

  return {
    grouped: false,
    memberId: memberId || undefined,
    events: rows.map((r) => mapEventRow(r, rsvpMap.get(r.id) || null)),
    total,
    limit,
    offset,
  };
};

/**
 * Member diary: same Events + EventRsvp data — not a separate domain.
 * Only events this member has RSVP'd to ("going"); favorite is `myRsvp.isFavorite` on that row.
 */
exports.diaryForMember = async (memberId, query) => {
  const id = Number(memberId);
  const member = await Member.findByPk(id);
  if (!member) {
    const err = new Error("Member not found");
    err.status = 404;
    throw err;
  }

  const ref = referenceDate(query);
  if (parseGrouped(query.grouped)) {
    const weekStart = startOfWeekMonday(ref);
    const weekEnd = endOfWeekSunday(ref);
    const nextStart = startOfNextCalendarMonth(ref);
    const nextEnd = endOfNextCalendarMonth(ref);

    const base = buildCategorySearchWhere(query);

    const [featured, thisWeek, nextMonth] = await Promise.all([
      eventsRepository.findEventsForMemberDiary(id, { ...base, isFeatured: true }, { order: [["startsAt", "ASC"]] }),
      eventsRepository.findEventsForMemberDiary(
        id,
        {
          ...base,
          isFeatured: false,
          startsAt: { [Op.between]: [weekStart, weekEnd] },
        },
        { order: [["startsAt", "ASC"]] },
      ),
      eventsRepository.findEventsForMemberDiary(
        id,
        {
          ...base,
          isFeatured: false,
          startsAt: { [Op.between]: [nextStart, nextEnd] },
        },
        { order: [["startsAt", "ASC"]] },
      ),
    ]);

    return {
      memberId: id,
      grouped: true,
      featured: featured.map(mapDiaryEventRow),
      thisWeek: thisWeek.map(mapDiaryEventRow),
      nextMonth: nextMonth.map(mapDiaryEventRow),
    };
  }

  const where = buildWhereFromQuery(query);
  const limit = Math.min(Number(query.limit) || 50, 100);
  const offset = Math.max(Number(query.offset) || 0, 0);

  const [total, rows] = await Promise.all([
    eventsRepository.countEventsForMemberDiary(id, where),
    eventsRepository.findEventsForMemberDiary(id, where, {
      order: [["startsAt", "ASC"]],
      limit,
      offset,
    }),
  ]);

  return {
    memberId: id,
    grouped: false,
    events: rows.map(mapDiaryEventRow),
    total,
    limit,
    offset,
  };
};

exports.getById = async (id, viewerMemberId = null) => {
  const row = await eventsRepository.findByPkWithRsvpCount(id);
  if (!row) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  let myRsvp = null;
  if (viewerMemberId) {
    const existing = await eventsRepository.findRsvp(id, viewerMemberId);
    myRsvp = formatMyRsvp(existing);
  }
  return mapEventRow(row, myRsvp);
};

exports.create = async (data) => {
  const row = await eventsRepository.create(data);
  return exports.getById(row.id);
};

exports.update = async (id, data) => {
  const updated = await eventsRepository.updateByPk(id, data);
  if (!updated) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  return mapEventRow(updated);
};

exports.remove = async (id) => {
  const ok = await eventsRepository.destroyByPk(id);
  if (!ok) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  return { id: Number(id), deleted: true };
};

/** Join event (RSVP) — appears in member diary after success */
exports.joinEvent = async (eventId, memberId, { isFavorite = false } = {}) => {
  await exports.rsvp(eventId, memberId, { isFavorite });
  const diaryRows = await eventsRepository.findEventsForMemberDiary(memberId, { id: eventId });
  const diaryEvent = diaryRows.length ? mapDiaryEventRow(diaryRows[0]) : await exports.getById(eventId, memberId);
  return {
    joined: true,
    inDiary: true,
    event: diaryEvent,
    message: "You joined this event. It now appears in your diary.",
  };
};

exports.leaveEvent = async (eventId, memberId) => {
  await exports.cancelRsvp(eventId, memberId);
  return {
    joined: false,
    inDiary: false,
    event: await exports.getById(eventId, memberId),
    message: "You left this event. It was removed from your diary.",
  };
};

exports.rsvp = async (eventId, memberId, { isFavorite = false } = {}) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  const member = await Member.findByPk(memberId);
  if (!member) {
    const err = new Error("Member not found");
    err.status = 404;
    throw err;
  }
  const existing = await eventsRepository.findRsvp(eventId, memberId);
  if (existing) {
    const err = new Error("Already RSVPed for this event");
    err.status = 409;
    throw err;
  }
  const attending = await eventsRepository.countConfirmedRsvps(eventId);
  if (event.capacity != null && attending >= event.capacity) {
    const err = new Error("Event is at capacity");
    err.status = 400;
    throw err;
  }
  await eventsRepository.createRsvp(eventId, memberId, { isFavorite });
  return exports.getById(eventId);
};

exports.patchRsvp = async (eventId, { memberId, isFavorite }) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  const updated = await eventsRepository.updateRsvpFavorite(eventId, memberId, isFavorite);
  if (!updated) {
    const err = new Error("RSVP not found");
    err.status = 404;
    throw err;
  }
  return exports.getById(eventId);
};

exports.cancelRsvp = async (eventId, memberId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }
  const ok = await eventsRepository.destroyRsvp(eventId, memberId);
  if (!ok) {
    const err = new Error("RSVP not found");
    err.status = 404;
    throw err;
  }
  return exports.getById(eventId);
};
