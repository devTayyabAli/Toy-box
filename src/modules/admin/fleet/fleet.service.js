"use strict";

const AppError = require("../../../utils/AppError");
const fleetRepository = require("./fleet.repository");
const {
  formatFleetListItem,
  formatFleetDetail,
  formatDashboardSummary,
  buildBayMap,
  formatOperationItem,
} = require("./fleet.formatter");

exports.list = async (query) => {
  const level = query.level || "01";
  const includeBayMap = query.includeBayMap !== "false";

  const [
    summary,
    dashboardSummaryRaw,
    total,
    rows,
    bayVehicles,
  ] = await Promise.all([
    fleetRepository.countSummary(query),
    fleetRepository.countDashboardSummary(query),
    fleetRepository.count(query),
    fleetRepository.findAll(query),
    includeBayMap ? fleetRepository.findAllWithBay(query) : Promise.resolve([]),
  ]);

  const dashboardSummary = formatDashboardSummary(dashboardSummaryRaw);
  const operations = rows.map(formatOperationItem);

  return {
    summary,
    dashboardSummary,
    bayMap: includeBayMap ? buildBayMap(bayVehicles, level) : null,
    operations,
    vehicles: rows.map(formatFleetListItem),
    total,
    limit: Math.min(Number(query.limit) || 50, 100),
    offset: Math.max(Number(query.offset) || 0, 0),
  };
};

exports.getById = async (id) => {
  const vehicle = await fleetRepository.findById(id);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  return formatFleetDetail(vehicle);
};
