const conciergeService = require("./concierge.service");

exports.getAll = async (req, res, next) => {
  try {
    const data = await conciergeService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await conciergeService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
