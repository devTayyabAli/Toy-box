const eventsService = require("./events.service");

exports.list = async (req, res, next) => {
  try {
    const data = await eventsService.list(req.query, req.user?.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.myDiary = async (req, res, next) => {
  try {
    const data = await eventsService.diaryForMember(req.user.id, req.query);
    res.json({ success: true, message: "My diary", data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const memberId = req.user?.id ?? req.query.memberId;
    const data = await eventsService.getById(req.params.id, memberId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.join = async (req, res, next) => {
  try {
    const data = await eventsService.joinEvent(req.params.id, req.user.id, {
      isFavorite: req.body.isFavorite,
    });
    res.status(201).json({ success: true, message: data.message, data });
  } catch (error) {
    next(error);
  }
};

exports.leave = async (req, res, next) => {
  try {
    const data = await eventsService.leaveEvent(req.params.id, req.user.id);
    res.json({ success: true, message: data.message, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await eventsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await eventsService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await eventsService.remove(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.rsvp = async (req, res, next) => {
  try {
    const data = await eventsService.rsvp(req.params.id, req.body.memberId, {
      isFavorite: req.body.isFavorite,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.patchRsvp = async (req, res, next) => {
  try {
    const data = await eventsService.patchRsvp(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.cancelRsvp = async (req, res, next) => {
  try {
    const data = await eventsService.cancelRsvp(req.params.id, req.body.memberId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
