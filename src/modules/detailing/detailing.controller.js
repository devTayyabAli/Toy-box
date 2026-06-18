const detailingService = require("./detailing.service");

exports.getCatalog = async (req, res, next) => {
  try {
    res.json({ success: true, data: detailingService.getCatalog() });
  } catch (error) {
    next(error);
  }
};

exports.getPackages = async (req, res, next) => {
  try {
    res.json({ success: true, data: detailingService.getPackages() });
  } catch (error) {
    next(error);
  }
};

exports.getAddons = async (req, res, next) => {
  try {
    res.json({ success: true, data: detailingService.getAddons() });
  } catch (error) {
    next(error);
  }
};

exports.getLocations = async (req, res, next) => {
  try {
    res.json({ success: true, data: detailingService.getLocations() });
  } catch (error) {
    next(error);
  }
};

exports.estimate = async (req, res, next) => {
  try {
    const data = detailingService.estimate(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.review = async (req, res, next) => {
  try {
    const data = await detailingService.reviewPayload(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    const data = await detailingService.listBookings(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const data = await detailingService.createBooking(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const data = await detailingService.getBooking(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const data = await detailingService.getProgress(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getJobDetail = async (req, res, next) => {
  try {
    const data = await detailingService.getJobDetail(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const data = await detailingService.updateBooking(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const data = await detailingService.cancelBooking(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.simulateProgress = async (req, res, next) => {
  try {
    const data = await detailingService.simulateProgress(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
