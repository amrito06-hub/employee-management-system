import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalSalary: 0,
    averageSalary: 0,
  });

  const [departments, setDepartments] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);

  const [payrollSummary, setPayrollSummary] = useState({
    totalPayrollAmount: 0,
    paidSalary: 0,
    pendingSalary: 0,
    totalRecords: 0,
    paidRecords: 0,
    pendingRecords: 0,
  });

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // DARK MODE
  // =========================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // =========================
  // LOAD ALL DASHBOARD DATA
  // =========================
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [
        statsResponse,
        departmentsResponse,
        recentResponse,
        payrollResponse,
      ] = await Promise.all([
        API.get("/dashboard/stats", authConfig),
        API.get("/dashboard/departments", authConfig),
        API.get("/dashboard/recent", authConfig),
        API.get("/payroll"),
      ]);

      setStats({
        totalEmployees: statsResponse.data?.totalEmployees || 0,
        activeEmployees: statsResponse.data?.activeEmployees || 0,
        inactiveEmployees: statsResponse.data?.inactiveEmployees || 0,
        totalSalary: statsResponse.data?.totalSalary || 0,
        averageSalary: statsResponse.data?.averageSalary || 0,
      });

      setDepartments(
        departmentsResponse.data?.departments || []
      );

      setRecentEmployees(
        recentResponse.data?.employees || []
      );

      const payrolls =
        payrollResponse.data?.payrolls || [];

      const totalPayrollAmount = payrolls.reduce(
        (total, payroll) =>
          total + Number(payroll.netSalary || 0),
        0
      );

      const paidPayrolls = payrolls.filter(
        (payroll) =>
          String(payroll.paymentStatus).toLowerCase() ===
          "paid"
      );

      const pendingPayrolls = payrolls.filter(
        (payroll) =>
          String(payroll.paymentStatus).toLowerCase() ===
          "pending"
      );

      const paidSalary = paidPayrolls.reduce(
        (total, payroll) =>
          total + Number(payroll.netSalary || 0),
        0
      );

      const pendingSalary = pendingPayrolls.reduce(
        (total, payroll) =>
          total + Number(payroll.netSalary || 0),
        0
      );

      setPayrollSummary({
        totalPayrollAmount,
        paidSalary,
        pendingSalary,
        totalRecords: payrolls.length,
        paidRecords: paidPayrolls.length,
        pendingRecords: pendingPayrolls.length,
      });
    } catch (err) {
      console.error("Dashboard Load Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Dashboard data load failed"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // CHART DATA
  // =========================
  const departmentChartData = departments.map(
    (department) => ({
      name: department.department || "Unknown",
      employees: Number(department.count || 0),
    })
  );

  const salaryChartData = [
    {
      name: "Paid Salary",
      amount: payrollSummary.paidSalary,
    },
    {
      name: "Pending Salary",
      amount: payrollSummary.pendingSalary,
    },
  ];

  const payrollStatusData = [
    {
      name: "Paid",
      value: payrollSummary.paidRecords,
    },
    {
      name: "Pending",
      value: payrollSummary.pendingRecords,
    },
  ];

  const chartColors = ["#22c55e", "#f97316"];

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const cardClass =
    "bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700";

  const chartTooltipStyle = {
    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
    border: darkMode
      ? "1px solid #475569"
      : "1px solid #e2e8f0",
    borderRadius: "10px",
    color: darkMode ? "#ffffff" : "#0f172a",
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

              <p className="text-slate-600 dark:text-slate-300">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Welcome back! Here's your employee overview.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Today
              </p>

              <p className="font-semibold text-slate-800 dark:text-white">
                {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>

            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              {refreshing
                ? "🔄 Refreshing..."
                : "🔄 Refresh Dashboard"}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-red-600 dark:text-red-300">
                ⚠️ {error}
              </p>

              <button
                onClick={() => loadDashboardData()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* MAIN STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

          <div className={cardClass}>
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                👥
              </div>

              <span className="text-green-500 text-sm font-semibold">
                Overview
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Total Employees
            </p>

            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
              {stats.totalEmployees}
            </h2>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
              ✅
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Active Employees
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeEmployees}
            </h2>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
              ⚠️
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Inactive Employees
            </p>

            <h2 className="text-3xl font-bold text-red-500 mt-2">
              {stats.inactiveEmployees}
            </h2>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
              💰
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Total Salary
            </p>

            <h2 className="text-2xl font-bold text-purple-600 mt-2 break-words">
              {formatCurrency(stats.totalSalary)}
            </h2>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
              📈
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Average Salary
            </p>

            <h2 className="text-2xl font-bold text-orange-500 mt-2 break-words">
              {formatCurrency(stats.averageSalary)}
            </h2>
          </div>

        </div>

        {/* PAYROLL SUMMARY */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Payroll Summary
            </h2>

            <button
              onClick={() => navigate("/payroll")}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
            >
              View Payroll →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <button
              onClick={() => navigate("/payroll")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                💵
              </div>

              <p className="text-slate-500 dark:text-slate-400 mt-5">
                Total Payroll Amount
              </p>

              <h3 className="text-2xl font-bold text-blue-600 mt-2 break-words">
                {formatCurrency(
                  payrollSummary.totalPayrollAmount
                )}
              </h3>
            </button>

            <button
              onClick={() => navigate("/payroll")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                ✅
              </div>

              <p className="text-slate-500 dark:text-slate-400 mt-5">
                Paid Salary
              </p>

              <h3 className="text-2xl font-bold text-green-600 mt-2 break-words">
                {formatCurrency(
                  payrollSummary.paidSalary
                )}
              </h3>
            </button>

            <button
              onClick={() => navigate("/payroll")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                ⏳
              </div>

              <p className="text-slate-500 dark:text-slate-400 mt-5">
                Pending Salary
              </p>

              <h3 className="text-2xl font-bold text-orange-500 mt-2 break-words">
                {formatCurrency(
                  payrollSummary.pendingSalary
                )}
              </h3>
            </button>

            <button
              onClick={() => navigate("/payroll")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                🧾
              </div>

              <p className="text-slate-500 dark:text-slate-400 mt-5">
                Total Payroll Records
              </p>

              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {payrollSummary.totalRecords}
              </h3>
            </button>

          </div>
        </div>

        {/* CHARTS */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
            Visual Analytics
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* DEPARTMENT CHART */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
                Department-wise Employee Distribution
              </h3>

              {departmentChartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No department data available.
                  </p>
                </div>
              ) : (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          darkMode
                            ? "#475569"
                            : "#e2e8f0"
                        }
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: darkMode
                            ? "#cbd5e1"
                            : "#475569",
                        }}
                        tickFormatter={(value) =>
                          value.length > 12
                            ? `${value.slice(0, 12)}...`
                            : value
                        }
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: darkMode
                            ? "#cbd5e1"
                            : "#475569",
                        }}
                      />

                      <Tooltip
                        contentStyle={chartTooltipStyle}
                      />

                      <Bar
                        dataKey="employees"
                        name="Employees"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* SALARY CHART */}
            <div className={cardClass}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Paid Salary vs Pending Salary
                </h3>

                <button
                  onClick={() => navigate("/payroll")}
                  className="text-blue-600 dark:text-blue-400 text-sm font-semibold"
                >
                  Open Payroll →
                </button>
              </div>

              {payrollSummary.totalRecords === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No payroll data available.
                  </p>
                </div>
              ) : (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          darkMode
                            ? "#475569"
                            : "#e2e8f0"
                        }
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: darkMode
                            ? "#cbd5e1"
                            : "#475569",
                        }}
                      />

                      <YAxis
                        tick={{
                          fill: darkMode
                            ? "#cbd5e1"
                            : "#475569",
                        }}
                        tickFormatter={(value) =>
                          `₹${value.toLocaleString(
                            "en-IN"
                          )}`
                        }
                      />

                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="amount"
                        name="Salary"
                        fill="#22c55e"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* PAYROLL STATUS CHART */}
            <div className={`${cardClass} xl:col-span-2`}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
                Payroll Records Status
              </h3>

              {payrollSummary.totalRecords === 0 ? (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No payroll records available.
                  </p>
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={payrollStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        label
                      >
                        {payrollStatusData.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                chartColors[index]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={chartTooltipStyle}
                      />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DEPARTMENT STATISTICS */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
            Department Statistics
          </h2>

          {departments.length === 0 ? (
            <div className={cardClass}>
              <p className="text-slate-500 dark:text-slate-400">
                No department data available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {departments.map((department) => (
                <div
                  key={department.department}
                  className={`${cardClass} overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white break-words min-w-0">
                      {department.department}
                    </h3>

                    <span className="text-2xl flex-shrink-0">
                      👥
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-blue-600 mt-4">
                    {department.count}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Employees
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT EMPLOYEES */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Recent Employees
            </h2>

            <button
              onClick={() => navigate("/employees")}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className={`${cardClass} overflow-hidden p-0`}>
            {recentEmployees.length === 0 ? (
              <div className="p-6">
                <p className="text-slate-500 dark:text-slate-400">
                  No recent employees found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                        Employee ID
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                        Name
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                        Department
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                        Designation
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                        Salary
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        onClick={() =>
                          navigate(
                            `/employees/${employee._id}`
                          )
                        }
                        className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {employee.employeeId}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                          {employee.fullName}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {employee.department}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {employee.designation}
                        </td>

                        <td className="px-6 py-4 font-semibold text-green-600">
                          {formatCurrency(employee.salary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-10 pb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            <button
              onClick={() => navigate("/employees")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <span className="text-3xl">👥</span>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-3">
                Manage Employees
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Add, edit and manage employees
              </p>
            </button>

            <button
              onClick={() => navigate("/departments")}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <span className="text-3xl">🏢</span>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-3">
                View Departments
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Check department-wise employees
              </p>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`${cardClass} text-left hover:shadow-lg transition`}
            >
              <span className="text-3xl">
                {darkMode ? "☀️" : "🌙"}
              </span>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-3">
                Change Theme
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Switch between light and dark mode
              </p>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;