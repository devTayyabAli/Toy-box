const { Booking, Vehicle, Member } = require("../../models");
const { SERVICE_TYPE } = require("./detailing.constants");

exports.findBookingById = (id) =>
  Booking.findOne({
    where: { id, serviceType: SERVICE_TYPE },
    include: [
      { model: Vehicle, as: "vehicle" },
      { model: Member, as: "member", attributes: ["id", "name", "email"] },
    ],
  });

exports.createBooking = (data) => Booking.create(data);

exports.updateBooking = async (id, data) => {
  const booking = await exports.findBookingById(id);
  if (!booking) return null;
  await booking.update(data);
  return exports.findBookingById(id);
};

exports.referenceExists = (referenceNumber) =>
  Booking.findOne({ where: { referenceNumber } });

exports.findBookings = ({ memberId, status, limit = 50 }) => {
  const where = { serviceType: SERVICE_TYPE };
  if (memberId) where.memberId = memberId;
  if (status) where.status = status;
  return Booking.findAll({
    where,
    include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "imageUrl"] }],
    order: [["createdAt", "DESC"]],
    limit,
  });
};
