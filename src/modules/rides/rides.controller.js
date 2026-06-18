const ridesService = require("./rides.service");

exports.getWizardSchema = async (req, res, next) => {
  try {
    res.json({ success: true, data: ridesService.getWizardSchema() });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await ridesService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await ridesService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await ridesService.createWithDocuments(req.body, req.files || {});
    res.status(201).json({ success: true, message: "Vehicle added", data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await ridesService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await ridesService.remove(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocuments = async (req, res, next) => {
  try {
    const data = await ridesService.uploadDocuments(req.params.id, req.files || {});
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
