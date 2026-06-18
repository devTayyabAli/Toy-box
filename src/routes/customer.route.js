const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validatePayload = require("../middlewares/validatePayload.middleware");
const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validators/customer.validator");
const CustomerController = require("../controllers/customer.controller");

router.use(authenticate);

router.post(
  "/customers",
  validatePayload(createCustomerSchema),
  CustomerController.create.bind(CustomerController),
);

router.get("/customers", CustomerController.list.bind(CustomerController));
router.get("/customers/:id", CustomerController.getById.bind(CustomerController));

router.put(
  "/customers/:id",
  validatePayload(updateCustomerSchema),
  CustomerController.update.bind(CustomerController),
);

router.delete("/customers/:id", CustomerController.remove.bind(CustomerController));

module.exports = router;
