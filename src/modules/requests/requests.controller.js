const requestsService = require("./requests.service");

exports.getAll = async (req, res, next) => {
  try {
    const data = await requestsService.getAll();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await requestsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
