import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    getDashboardStats();
    getDepartmentStats();
    getRecentEmployees();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Dashboard Statistics
  const getDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log("Dashboard Stats Error:", error);

      alert(
        error.response?.data?.message ||
          "Dashboard Data Load Failed"
      );
    }
  };

  // Department Statistics
  const getDepartmentStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/dashboard/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(res.data.departments || []);
    } catch (error) {
      console.log("Department Stats Error:", error);
    }
  };

  // Recent Employees
  const getRecentEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/dashboard/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecentEmployees(res.data.employees || []);
    } catch (error) {
      console.log("Recent Employees Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Welcome back! Here's your employee overview.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-sm">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today
            </p>

            <p className="font-semibold text-slate-800 dark:text-white">
              {new Date().toLocaleDateString("en-IN")}
            </p>

          </div>

        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Total Employees */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                👥
              </div>

              <span className="text-green-500 text-sm">
                +100%
              </span>

            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Total Employees
            </p>

            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
              {stats.totalEmployees}
            </h3>

          </div>

          {/* Active Employees */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
              ✅
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Active Employees
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeEmployees}
            </h3>

          </div>

          {/* Inactive Employees */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">

            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
              ⚠️
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Inactive Employees
            </p>

            <h3 className="text-3xl font-bold text-red-500 mt-2">
              {stats.inactiveEmployees}
            </h3>

          </div>

          {/* Total Salary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
              💰
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Total Salary
            </p>

            <h3 className="text-2xl font-bold text-purple-600 mt-2">
              ₹{Number(stats.totalSalary).toLocaleString("en-IN")}
            </h3>

          </div>

          {/* Average Salary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
              📈
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-5">
              Average Salary
            </p>

            <h3 className="text-2xl font-bold text-orange-500 mt-2">
              ₹{Number(stats.averageSalary).toLocaleString("en-IN")}
            </h3>

          </div>

        </div>

        {/* DEPARTMENT STATISTICS */}
        <div className="mt-10">

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
            Department Statistics
          </h2>

          {departments.length === 0 ? (

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">

              <p className="text-slate-500 dark:text-slate-400">
                No department data available.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {departments.map((department) => (

                <div
                  key={department.department}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm"
                >

                  <div className="flex items-center justify-between gap-3">

                    <h3 className="font-semibold text-slate-800 dark:text-white break-words">
                      {department.department}
                    </h3>

                    <span className="text-2xl">
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
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </button>

          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">

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
                        className="border-t border-slate-200 dark:border-slate-700"
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
                          ₹{Number(employee.salary).toLocaleString("en-IN")}
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
        <div className="mt-10">

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Manage Employees */}
            <button
              onClick={() => navigate("/employees")}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-left hover:shadow-lg transition"
            >

              <span className="text-3xl">
                👥
              </span>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-3">
                Manage Employees
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Add, edit and manage employees
              </p>

            </button>

            {/* View Departments */}
            <button
              onClick={() => navigate("/departments")}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-left hover:shadow-lg transition"
            >

              <span className="text-3xl">
                🏢
              </span>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-3">
                View Departments
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Check department-wise employees
              </p>

            </button>

            {/* Change Theme */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-left hover:shadow-lg transition"
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