const Payroll = require("../models/Payroll");

// Create Payroll
const createPayroll = async (req, res) => {
  try {
    const {
      employee,
      month,
      basicSalary,
      allowance = 0,
      bonus = 0,
      deduction = 0,
    } = req.body;

    if (!employee || !month || !basicSalary) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, month and basic salary are required",
      });
    }

    const netSalary =
      Number(basicSalary) +
      Number(allowance) +
      Number(bonus) -
      Number(deduction);

    const payroll = await Payroll.create({
      employee,
      month,
      basicSalary: Number(basicSalary),
      allowance: Number(allowance),
      bonus: Number(bonus),
      deduction: Number(deduction),
      netSalary,
    });

    res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      payroll,
    });
  } catch (error) {
    console.error("Create Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Payrolls
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate(
        "employee",
        "employeeId fullName department designation"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payrolls,
    });
  } catch (error) {
    console.error("Get Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark Payroll as Paid
const markPayrollAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      {
        paymentStatus: "Paid",
        paymentDate: new Date(),
      },
      {
        new: true,
      }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll marked as Paid successfully",
      payroll,
    });
  } catch (error) {
    console.error("Mark Payroll Paid Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayroll,
  getPayrolls,
  markPayrollAsPaid,
};