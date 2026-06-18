const userService = require("./user.service");
const eventsService = require("../events/events.service");

exports.getAll = async (req, res, next) => {
  try {
    const data = await userService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await userService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/** Member diary — events this member is going to (`EventRsvp`), not a separate table. */
exports.getDiary = async (req, res, next) => {
  try {
    const data = await eventsService.diaryForMember(req.params.memberId, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
