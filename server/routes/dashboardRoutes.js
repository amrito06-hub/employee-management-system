const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getDepartmentStats,
  getRecentEmployees,
} = require("../controllers/dashboardController");

// Dashboard Statistics
router.get("/stats", authMiddleware, getDashboardStats);

// Department Wise Statistics
router.get("/departments", authMiddleware, getDepartmentStats);

// Recent Employees
router.get("/recent", authMiddleware, getRecentEmployees);

module.exports = router;