"use strict";

const Response = require("../../../helpers/response.helper");
const { buildBodyFromMultipart } = require("../../rides/rides.multipart");

function parseAdminInventoryMultipart(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  req.isAdminInventoryMultipart = contentType.includes("multipart/form-data");

  if (!req.isAdminInventoryMultipart) {
    return next();
  }

  try {
    req.body = buildBodyFromMultipart(req.body);
    delete req.body.memberId;

    if (req.method === "PATCH") {
      return next();
    }

    if (!req.body.vehicleInfo) {
      throw new Error(
        "vehicleInfo required — make, model, year, engine, power, transmission, drive, zeroToHundred, topSpeed",
      );
    }
    if (!req.body.ownershipInfo) {
      throw new Error(
        "ownershipInfo required — colour, chassisNo, plate, purchasedAt, storageBay, mileage",
      );
    }
    if (!req.body.health?.length) {
      throw new Error("health required — all 6 wizard categories");
    }

    req.body.registrationStep = "complete";
    return next();
  } catch (err) {
    return Response.validationError(res, "Invalid admin inventory form", [
      { field: "form", message: err.message },
    ]);
  }
}

module.exports = { parseAdminInventoryMultipart };
