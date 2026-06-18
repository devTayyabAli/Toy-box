const { Request } = require("../../models");

exports.findAll = () => Request.findAll();
exports.create = (data) => Request.create(data);
exports.findByPk = (id) => Request.findByPk(id);
