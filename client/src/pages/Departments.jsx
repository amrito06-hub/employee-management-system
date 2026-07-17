import { useEffect, useState } from "react";
import API from "../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartmentStats();
  }, []);

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
      console.log("Department Load Error:", error);

      alert(
        error.response?.data?.message ||
          "Department Data Load Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Departments
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Department-wise employee statistics
        </p>

      </div>

      {/* Loading */}
      {loading ? (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center">

          <p className="text-gray-500 dark:text-gray-400">
            Loading departments...
          </p>

        </div>

      ) : departments.length === 0 ? (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center">

          <p className="text-gray-500 dark:text-gray-400">
            No departments found
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {departments.map((department, index) => (

            <div
              key={department.department || index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
            >

              {/* Department Icon */}
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl mb-5">
                🏢
              </div>

              {/* Department Name */}
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {department.department}
              </h2>

              {/* Employee Count */}
              <p className="text-gray-500 dark:text-gray-400 mt-3">
                Total Employees
              </p>

              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {department.count}
              </p>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Employees
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Departments;