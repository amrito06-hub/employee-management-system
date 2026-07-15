const Employee = require("../models/employee");

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const employees = await Employee.find();

    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
      (emp) => emp.status === "Active"
    ).length;

    const inactiveEmployees = employees.filter(
      (emp) => emp.status === "Inactive"
    ).length;

    const totalSalary = employees.reduce(
      (sum, emp) => sum + emp.salary,
      0
    );

    const averageSalary =
      totalEmployees > 0
        ? Math.round(totalSalary / totalEmployees)
        : 0;

    res.status(200).json({
      success: true,
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalSalary,
      averageSalary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Department Wise Employees
const getDepartmentStats = async (req, res) => {
  try {
    const departments = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Recent Employees
const getRecentEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getDepartmentStats,
  getRecentEmployees,
};