const express = require("express");

const {
  createPayroll,
  getPayrolls,
  markPayrollAsPaid,
} = require("../controllers/payrollController");

const router = express.Router();

// Create Payroll
router.post("/create", createPayroll);

// Get All Payrolls
router.get("/", getPayrolls);

// Mark Payroll as Paid
router.put("/:id/pay", markPayrollAsPaid);

module.exports = router;