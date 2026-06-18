const requestsRepository = require("./requests.repository");

const VALID_STATUSES = ["Requested", "Accepted", "In Progress", "Upcoming", "Completed"];

exports.getAll = () => requestsRepository.findAll();
exports.create = (data) => requestsRepository.create(data);

exports.updateLifecycle = async (id, status) => {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error("Invalid status");
    err.status = 400;
    throw err;
  }
  const request = await requestsRepository.findByPk(id);
  if (!request) {
    const err = new Error("Request not found");
    err.status = 404;
    throw err;
  }
  request.status = status;
  await request.save();
  return request;
};
