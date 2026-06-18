const { Member } = require("../../models");

exports.findAll = () => Member.findAll();
exports.create = (data) => Member.create(data);
