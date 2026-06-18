const sourcingService = require("./sourcing.service");

exports.getOverview = async (req, res, next) => {
  try {
    res.json({ success: true, data: sourcingService.getOverview() });
  } catch (e) {
    next(e);
  }
};

exports.review = async (req, res, next) => {
  try {
    res.json({ success: true, data: sourcingService.review(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: await sourcingService.createRequest(req.body),
    });
  } catch (e) {
    next(e);
  }
};

exports.createMyRequest = async (req, res, next) => {
  try {
    const data = await sourcingService.createRequest({
      ...req.body,
      memberId: req.user.id,
    });
    res.status(201).json({ success: true, message: data.message, data });
  } catch (e) {
    next(e);
  }
};

exports.getPendingVehicle = async (req, res, next) => {
  try {
    const assignmentService = require("./sourcingAssignment.service");
    const data = await assignmentService.getPendingOfferForMember(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.approveVehicle = async (req, res, next) => {
  try {
    const assignmentService = require("./sourcingAssignment.service");
    const data = await assignmentService.approveAssignment(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true, message: data.message, data });
  } catch (e) {
    next(e);
  }
};

exports.rejectVehicle = async (req, res, next) => {
  try {
    const assignmentService = require("./sourcingAssignment.service");
    const data = await assignmentService.rejectAssignment(
      req.params.id,
      req.user.id,
      req.body.rejectionReason,
    );
    res.json({ success: true, message: data.message, data });
  } catch (e) {
    next(e);
  }
};

exports.listRequests = async (req, res, next) => {
  try {
    res.json({ success: true, data: await sourcingService.listRequests(req.query) });
  } catch (e) {
    next(e);
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    res.json({ success: true, data: await sourcingService.getRequest(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    res.json({ success: true, data: await sourcingService.getStatus(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    res.json({ success: true, data: await sourcingService.cancel(req.params.id) });
  } catch (e) {
    next(e);
  }
};

exports.simulateProgress = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await sourcingService.simulateProgress(req.params.id),
    });
  } catch (e) {
    next(e);
  }
};
