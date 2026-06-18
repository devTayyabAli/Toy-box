const asyncHandler = require("../../middlewares/asyncHandler");
const supportService = require("./support.service");

exports.getOverview = asyncHandler(async (req, res) => {
  const data = await supportService.getOverview();
  res.json({ success: true, data });
});

exports.search = asyncHandler(async (req, res) => {
  const data = await supportService.search(req.query.q);
  res.json({ success: true, data });
});
