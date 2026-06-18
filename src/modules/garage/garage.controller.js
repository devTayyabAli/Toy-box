const garageService = require("./garage.service");

function authMemberId(req) {
  return req.user?.id ?? null;
}

exports.getOverview = async (req, res, next) => {
  try {
    const data = await garageService.getOverview(req.query, authMemberId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.listVehicles = async (req, res, next) => {
  try {
    const data = await garageService.listVehicles(req.query, authMemberId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleDetails = async (req, res, next) => {
  try {
    const data = await garageService.getVehicleDetails(req.params.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleActions = async (req, res, next) => {
  try {
    const data = await garageService.getVehicleActions(
      req.params.id,
      req.query.limit ? Number(req.query.limit) : 20,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getHealthReport = async (req, res, next) => {
  try {
    const data = await garageService.getHealthReport(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateHealth = async (req, res, next) => {
  try {
    const data = await garageService.updateHealth(req.params.id, req.body.health);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getSpecs = async (req, res, next) => {
  try {
    const data = await garageService.getSpecs(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const data = await garageService.getDocuments(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required (field name: file)",
      });
    }
    const data = await garageService.uploadDocument(
      req.params.id,
      req.body.documentKey,
      req.file,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.togglePriority = async (req, res, next) => {
  try {
    const data = await garageService.togglePriority(req.params.id, req.body.isPriority);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.listRequests = async (req, res, next) => {
  try {
    const data = await garageService.listRequests(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    const data = await garageService.getRequest(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRequestCategories = async (req, res, next) => {
  try {
    const data = await garageService.getRequestCategories(req.query.memberId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getServiceOptions = async (req, res, next) => {
  try {
    const data = await garageService.getServiceOptions();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    const data = await garageService.createRequest(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleRequests = async (req, res, next) => {
  try {
    const data = await garageService.getVehicleRequests(req.params.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
