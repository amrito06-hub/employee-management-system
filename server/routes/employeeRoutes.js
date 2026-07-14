const express = require("express");
const router = express.Router();

const {
  addEmployee,
  getEmployees,
} = require("../controllers/employeeController");

// Test Route
router.get("/test", (req, res) => {
  res.send("Employee Route Working");
});

// Get All Employees
router.get("/", getEmployees);

// Add Employee
router.post("/add", addEmployee);

module.exports = router;