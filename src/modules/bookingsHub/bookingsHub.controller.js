const AppError = require("../../utils/AppError");
const bookingsHubService = require("./bookingsHub.service");

exports.listMine = async (req, res, next) => {
  try {
    const memberId = req.query.memberId || req.user?.id;
    if (!memberId) {
      throw new AppError("memberId is required", 400);
    }
    const data = await bookingsHubService.listMyBookings({
      memberId: Number(memberId),
      tab: req.query.tab,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
