import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EmployeeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    getEmployeeDetails();
  }, [id]);

  // Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Get Employee Details
  const getEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployee(res.data.employee);
    } catch (error) {
      console.log("Employee Details Error:", error);

      alert(
        error.response?.data?.message ||
          "Employee Details Load Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-blue-700 dark:bg-gray-950 text-white p-5">

        <h2 className="text-2xl font-bold mb-10">
          Employee EMS
        </h2>

        <ul className="space-y-5">

          <li
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer hover:text-yellow-300"
          >
            📊 Dashboard
          </li>

          <li
            onClick={() => navigate("/employees")}
            className="cursor-pointer hover:text-yellow-300"
          >
            👥 Employees
          </li>

          <li
            onClick={() => navigate("/departments")}
            className="cursor-pointer hover:text-yellow-300"
          >
            🏢 Departments
          </li>

          <li
            onClick={() => setDarkMode(!darkMode)}
            className="cursor-pointer hover:text-yellow-300"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </li>

          <li
            onClick={logout}
            className="cursor-pointer text-red-300 hover:text-red-500"
          >
            🚪 Logout
          </li>

        </ul>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/employees")}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg"
        >
          ← Back to Employees
        </button>

        {loading ? (

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center">

            <p className="text-gray-500 dark:text-gray-400">
              Loading employee details...
            </p>

          </div>

        ) : !employee ? (

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center">

            <p className="text-red-500">
              Employee not found
            </p>

          </div>

        ) : (

          <div className="max-w-4xl">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {employee.fullName}
                  </h1>

                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {employee.designation}
                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    employee.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {employee.status}
                </span>

              </div>

            </div>

            {/* Employee Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Employee Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Employee ID
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.employeeId}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Full Name
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Email
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.email}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Phone
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.phone}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Department
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.department}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Designation
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.designation}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Salary
                  </p>

                  <p className="text-lg font-semibold text-green-600">
                    ₹{" "}
                    {Number(employee.salary).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Joining Date
                  </p>

                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {employee.joiningDate
                      ? new Date(
                          employee.joiningDate
                        ).toLocaleDateString("en-IN")
                      : "Not Available"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default EmployeeDetails;