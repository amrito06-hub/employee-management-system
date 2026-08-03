const express = require("express");
const router = express.Router();

const {
  markAttendance,
  bulkMarkAttendance,
  checkIn,
  checkOut,
  getDailyAttendance,
  getMonthlyAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

// Admin manual marking
router.post("/mark", markAttendance);
router.post("/bulk-mark", bulkMarkAttendance);

// Employee self check-in / check-out
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

// Views
router.get("/daily", getDailyAttendance);       // ?date=2026-07-29
router.get("/monthly", getMonthlyAttendance);   // ?employee=id&month=7&year=2026

// Edit / delete a specific record
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;
