const asyncHandler = require("../../middlewares/asyncHandler");
const notificationsService = require("./notifications.service");
const pushDevicesService = require("./pushDevices.service");

exports.getSettings = asyncHandler(async (req, res) => {
  const data = await notificationsService.getSettings(req.user.id);
  res.json({ success: true, data });
});

exports.patchSettings = asyncHandler(async (req, res) => {
  const data = await notificationsService.updateSettings(req.user.id, req.body);
  res.json({ success: true, data });
});

exports.listInbox = asyncHandler(async (req, res) => {
  const memberId = req.query.memberId || req.user?.id;
  const data = await notificationsService.listInbox(Number(memberId), req.query);
  res.json({ success: true, data });
});

exports.markInboxRead = asyncHandler(async (req, res) => {
  const memberId = req.query.memberId || req.user?.id;
  const data = await notificationsService.markInboxRead(Number(memberId), req.params.id);
  res.json({ success: true, data });
});

exports.markAllInboxRead = asyncHandler(async (req, res) => {
  const memberId = req.query.memberId || req.user?.id;
  const data = await notificationsService.markAllInboxRead(Number(memberId));
  res.json({ success: true, data });
});

exports.registerDevice = asyncHandler(async (req, res) => {
  const data = await pushDevicesService.registerDevice(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});

exports.unregisterDevice = asyncHandler(async (req, res) => {
  const data = await pushDevicesService.unregisterDevice(req.user.id, req.body.token);
  res.json({ success: true, data });
});

exports.listDevices = asyncHandler(async (req, res) => {
  const data = await pushDevicesService.listDevices(req.user.id);
  res.json({ success: true, data });
});

exports.getFirebaseConfig = asyncHandler(async (req, res) => {
  const data = await notificationsService.getFirebaseClientConfig();
  res.json({ success: true, data });
});

exports.getPushStatus = asyncHandler(async (req, res) => {
  const data = await notificationsService.getPushStatus(req.user.id);
  res.json({ success: true, data });
});

exports.sendTestPush = asyncHandler(async (req, res) => {
  const data = await notificationsService.sendTestPush(req.user.id, req.body);
  res.json({ success: true, data });
});
