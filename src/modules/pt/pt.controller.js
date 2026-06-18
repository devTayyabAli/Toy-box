const ptService = require("./pt.service");

exports.getAll = async (req, res) => {
  const data = await ptService.list();
  res.json({ success: true, data });
};
