const Attendance = require("../models/Attendance");
const Employee = require("../models/employee");

// Helper: strip time so date comparisons are consistent (one record per day)
const normalizeDate = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ------------------------------------------------------------------
// ADMIN: Manually mark/update attendance for one employee on one date
// (upsert - creates if not exists, updates if it does)
// ------------------------------------------------------------------
const markAttendance = async (req, res) => {
  try {
    const { employee, date, status, remarks } = req.body;

    if (!employee || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "employee, date and status are required",
      });
    }

    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    const normalizedDate = normalizeDate(date);

    const attendance = await Attendance.findOneAndUpdate(
      { employee, date: normalizedDate },
      {
        employee,
        employeeId: emp.employeeId,
        date: normalizedDate,
        status,
        remarks: remarks || "",
        markedBy: "Admin",
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Attendance Marked Successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// ADMIN: Bulk mark attendance for multiple employees at once
// body: { date, records: [{ employee, status, remarks }] }
// ------------------------------------------------------------------
const bulkMarkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "date and a non-empty records array are required",
      });
    }

    const normalizedDate = normalizeDate(date);

    const results = await Promise.allSettled(
      records.map(async (r) => {
        const emp = await Employee.findById(r.employee);
        if (!emp) throw new Error(`Employee ${r.employee} not found`);

        return Attendance.findOneAndUpdate(
          { employee: r.employee, date: normalizedDate },
          {
            employee: r.employee,
            employeeId: emp.employeeId,
            date: normalizedDate,
            status: r.status,
            remarks: r.remarks || "",
            markedBy: "Admin",
          },
          { new: true, upsert: true, runValidators: true }
        );
      })
    );

    const succeeded = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason.message);

    res.status(200).json({
      success: true,
      message: "Bulk Attendance Processed",
      updatedCount: succeeded.length,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// EMPLOYEE SELF: Check-in for today
// ------------------------------------------------------------------
const checkIn = async (req, res) => {
  try {
    const { employee } = req.body;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "employee is required",
      });
    }

    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    const today = normalizeDate();

    const existing = await Attendance.findOne({ employee, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Already Checked In Today",
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { employee, date: today },
      {
        employee,
        employeeId: emp.employeeId,
        date: today,
        checkIn: new Date(),
        status: "Present",
        markedBy: "Self",
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Checked In Successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// EMPLOYEE SELF: Check-out for today (computes work hours)
// ------------------------------------------------------------------
const checkOut = async (req, res) => {
  try {
    const { employee } = req.body;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "employee is required",
      });
    }

    const today = normalizeDate();

    const attendance = await Attendance.findOne({ employee, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Please Check In First",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already Checked Out Today",
      });
    }

    const checkOutTime = new Date();
    const hours =
      (checkOutTime.getTime() - new Date(attendance.checkIn).getTime()) /
      (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.workHours = Math.round(hours * 100) / 100;
    // Less than 4 hours worked -> mark as Half Day automatically
    if (attendance.workHours < 4) {
      attendance.status = "Half Day";
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Checked Out Successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// Daily attendance sheet: all employees for a given date
// (includes employees with no record yet, marked as "Not Marked")
// ------------------------------------------------------------------
const getDailyAttendance = async (req, res) => {
  try {
    const date = req.query.date;
    const normalizedDate = normalizeDate(date);

    const [allEmployees, attendanceRecords] = await Promise.all([
      Employee.find().sort({ employeeId: 1 }),
      Attendance.find({ date: normalizedDate }),
    ]);

    const attendanceMap = {};
    attendanceRecords.forEach((rec) => {
      attendanceMap[rec.employee.toString()] = rec;
    });

    const sheet = allEmployees.map((emp) => {
      const record = attendanceMap[emp._id.toString()];
      return {
        employee: emp._id,
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        department: emp.department,
        status: record ? record.status : "Not Marked",
        checkIn: record ? record.checkIn : null,
        checkOut: record ? record.checkOut : null,
        workHours: record ? record.workHours : 0,
        remarks: record ? record.remarks : "",
      };
    });

    res.status(200).json({
      success: true,
      date: normalizedDate,
      count: sheet.length,
      sheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// Monthly attendance for one employee (calendar view + summary)
// query: employee, month (1-12), year
// ------------------------------------------------------------------
const getMonthlyAttendance = async (req, res) => {
  try {
    const { employee, month, year } = req.query;

    if (!employee || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "employee, month and year are required",
      });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const records = await Attendance.find({
      employee,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const summary = {
      Present: 0,
      Absent: 0,
      "Half Day": 0,
      Leave: 0,
      Holiday: 0,
    };
    records.forEach((r) => {
      if (summary[r.status] !== undefined) summary[r.status]++;
    });

    res.status(200).json({
      success: true,
      month: Number(month),
      year: Number(year),
      count: records.length,
      summary,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// Update a single attendance record (admin correction)
// ------------------------------------------------------------------
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance Record Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance Updated Successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------------------------------------
// Delete an attendance record
// ------------------------------------------------------------------
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance Record Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance Record Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  checkIn,
  checkOut,
  getDailyAttendance,
  getMonthlyAttendance,
  updateAttendance,
  deleteAttendance,
};
