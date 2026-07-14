const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  searchEmployee,
} = require("../controllers/employeeController");

// Test Route
router.get("/test", (req, res) => {
  res.send("Employee Route Working");
});

// Search Employee
router.get("/search", authMiddleware, searchEmployee);

// Get All Employees
router.get("/", authMiddleware, getEmployees);

// Add Employee
router.post("/add", authMiddleware, addEmployee);

// Update Employee
router.put("/:id", authMiddleware, updateEmployee);

// Delete Employee
router.delete("/:id", authMiddleware, deleteEmployee);

module.exports = router;