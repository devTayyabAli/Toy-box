const dashboardService = require("./dashboard.service");

exports.getSummary = async (req, res, next) => {
  try {
    const memberId = req.query.memberId || req.user?.id;
    const data = await dashboardService.getSummary(Number(memberId));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
