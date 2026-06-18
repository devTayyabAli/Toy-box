const clinicService = require("./clinic.service");

exports.getAll = async (req, res) => {
  const data = await clinicService.list();
  res.json({ success: true, data });
};
