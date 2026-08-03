const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    workHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Half Day",
        "Leave",
        "Holiday",
        "Work From Home",
      ],
      default: "Present",
    },

    markedBy: {
      type: String,
      enum: ["Self", "Admin"],
      default: "Admin",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same employee on the same day
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);