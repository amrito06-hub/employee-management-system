const express = require("express");

const {
  createPayroll,
  getPayrolls,
} = require("../controllers/payrollController");

const router = express.Router();

// Create Payroll
router.post("/create", createPayroll);

// Get All Payrolls
router.get("/", getPayrolls);

module.exports = router;