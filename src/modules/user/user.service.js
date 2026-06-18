const userRepository = require("./user.repository");

exports.list = () => userRepository.findAll();
exports.create = (data) => userRepository.create(data);
