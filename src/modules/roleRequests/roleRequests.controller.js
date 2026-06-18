const roleRequestsService = require("./roleRequests.service");

exports.getAll = async (req, res) => {
  const data = await roleRequestsService.list();
  res.json({ success: true, data });
};
