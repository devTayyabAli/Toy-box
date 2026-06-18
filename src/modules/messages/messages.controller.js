const messagesService = require("./messages.service");

exports.list = async (req, res, next) => {
  try {
    const data = await messagesService.list(req.query);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.send = async (req, res, next) => {
  try {
    const data = await messagesService.send(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const data = await messagesService.markRead(req.params.memberId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
