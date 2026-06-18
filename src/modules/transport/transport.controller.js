const transportService = require("./transport.service");

exports.listServiceTypes = async (req, res, next) => {
  try {
    res.json({ success: true, data: transportService.listServiceTypes() });
  } catch (e) {
    next(e);
  }
};

exports.review = async (req, res, next) => {
  try {
    res.json({ success: true, data: await transportService.review(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await transportService.create(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json({ success: true, data: await transportService.list(req.query) });
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await transportService.getById(req.params.id, req.query),
    });
  } catch (e) {
    next(e);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    res.json({ success: true, data: await transportService.getStatus(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    res.json({ success: true, data: await transportService.cancel(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.simulateProgress = async (req, res, next) => {
  try {
    res.json({ success: true, data: await transportService.simulateProgress(req.params.id) });
  } catch (e) {
    next(e);
  }
};
