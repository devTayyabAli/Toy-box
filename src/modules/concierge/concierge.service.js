const conciergeRepository = require("./concierge.repository");

exports.list = () => conciergeRepository.getAll();
exports.create = (data) => conciergeRepository.create(data);
