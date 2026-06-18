const maintenanceService = require("./maintenance.service");

exports.getCatalog = async (req, res, next) => {
  try {
    res.json({ success: true, data: maintenanceService.getCatalog() });
  } catch (e) {
    next(e);
  }
};

exports.getServiceTypes = async (req, res, next) => {
  try {
    res.json({ success: true, data: maintenanceService.getServiceTypes() });
  } catch (e) {
    next(e);
  }
};

exports.getLocations = async (req, res, next) => {
  try {
    res.json({ success: true, data: maintenanceService.getLocations() });
  } catch (e) {
    next(e);
  }
};

exports.estimate = async (req, res, next) => {
  try {
    res.json({ success: true, data: maintenanceService.estimate(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.review = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.review(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.listRequests = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.listRequests(req.query) });
  } catch (e) {
    next(e);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: await maintenanceService.createRequest(req.body),
    });
  } catch (e) {
    next(e);
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.getRequest(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.getStatus(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.getApproval = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.getApproval(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.approveAndPay = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.approveAndPay(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.cancel(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.updateRequest(req.params.id, req.body) });
  } catch (e) {
    next(e);
  }
};

exports.listJobs = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.listJobs(req.query) });
  } catch (e) {
    next(e);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    res.json({ success: true, data: await maintenanceService.getJob(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.updateJobStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await maintenanceService.updateJobStatus(req.params.id, req.body.status),
    });
  } catch (e) {
    next(e);
  }
};

exports.updateChecklist = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await maintenanceService.updateChecklist(req.params.id, req.body.items),
    });
  } catch (e) {
    next(e);
  }
};

exports.simulateProgress = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await maintenanceService.simulateProgress(req.params.id),
    });
  } catch (e) {
    next(e);
  }
};
