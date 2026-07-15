import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalSalary: 0,
    averageSalary: 0,
  });

  useEffect(() => {
    getDashboardStats();
  }, []);

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
      console.log(error);
      alert("Dashboard Data Load Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}

      <div className="w-64 bg-blue-700 text-white p-5">

        <h2 className="text-2xl font-bold mb-10">
          Employee EMS
        </h2>

        <ul className="space-y-5">

          <li className="cursor-pointer hover:text-yellow-300">
            Dashboard
          </li>

          <li className="cursor-pointer hover:text-yellow-300">
            Employees
          </li>

          <li className="cursor-pointer hover:text-yellow-300">
            Departments
          </li>

          <li
            onClick={logout}
            className="cursor-pointer text-red-300 hover:text-red-500"
          >
            Logout
          </li>

        </ul>

      </div>

      {/* Main Content */}

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold">
              Total Employees
            </h3>

            <p className="text-4xl text-blue-700 mt-3">
              {stats.totalEmployees}
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold">
              Active Employees
            </h3>

            <p className="text-4xl text-green-600 mt-3">
              {stats.activeEmployees}
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold">
              Inactive Employees
            </h3>

            <p className="text-4xl text-red-600 mt-3">
              {stats.inactiveEmployees}
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold">
              Total Salary
            </h3>

            <p className="text-4xl text-purple-700 mt-3">
              ₹ {stats.totalSalary}
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold">
              Average Salary
            </h3>

            <p className="text-4xl text-orange-600 mt-3">
              ₹ {stats.averageSalary}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;