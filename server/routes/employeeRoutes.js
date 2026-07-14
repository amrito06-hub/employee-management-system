const express = require("express");
const router = express.Router();

const {
  addEmployee,
  getEmployees,
  searchEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// Test Route
router.get("/test", (req, res) => {
  res.send("Employee Route Working");
});

// Search Employee
router.get("/search", searchEmployee);

// Get All Employees
router.get("/", getEmployees);

// Add Employee
router.post("/add", addEmployee);

// Update Employee
router.put("/:id", updateEmployee);

// Delete Employee
router.delete("/:id", deleteEmployee);

module.exports = router;