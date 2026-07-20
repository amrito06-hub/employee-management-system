import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Departments() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const [departmentResponse, employeeResponse] =
        await Promise.all([
          API.get("/dashboard/departments"),
          API.get("/employees"),
        ]);

      setDepartments(
        departmentResponse.data.departments || []
      );

      setEmployees(
        employeeResponse.data.employees || []
      );
    } catch (error) {
      console.error(
        "Departments Load Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Department data load failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const getDepartmentEmployees = (departmentName) => {
    return employees.filter(
      (employee) =>
        employee.department === departmentName
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8 text-slate-800 dark:text-white">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Departments
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              View employees department-wise
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            ← Back to Dashboard
          </button>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">
              Loading departments...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm">

            <p className="text-red-500 mb-4">
              {error}
            </p>

            <button
              onClick={loadDepartments}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          departments.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm">

              <p className="text-slate-500 dark:text-slate-400">
                No department data available.
              </p>

            </div>
          )}

        {/* DEPARTMENT CARDS */}
        {!loading &&
          !error &&
          departments.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {departments.map((department) => {

                const departmentEmployees =
                  getDepartmentEmployees(
                    department.department
                  );

                return (
                  <div
                    key={department.department}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h2 className="text-xl font-bold break-words">
                          {department.department}
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                          Department
                        </p>

                      </div>

                      <div className="text-3xl">
                        🏢
                      </div>

                    </div>

                    <div className="mt-6">

                      <p className="text-4xl font-bold text-blue-600">
                        {department.count}
                      </p>

                      <p className="text-slate-500 dark:text-slate-400">
                        Total Employees
                      </p>

                    </div>

                    {departmentEmployees.length > 0 && (

                      <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">

                        <p className="font-semibold mb-3">
                          Employees
                        </p>

                        <div className="space-y-2 max-h-40 overflow-y-auto">

                          {departmentEmployees.map(
                            (employee) => (

                              <button
                                key={employee._id}
                                onClick={() =>
                                  navigate(
                                    `/employees/${employee._id}`
                                  )
                                }
                                className="w-full text-left p-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 transition"
                              >

                                <p className="font-semibold truncate">
                                  {employee.fullName}
                                </p>

                                <p className="text-sm text-slate-500 dark:text-slate-300 truncate">
                                  {employee.designation}
                                </p>

                              </button>

                            )
                          )}

                        </div>

                      </div>

                    )}

                  </div>
                );
              })}

            </div>

          )}

      </div>

    </div>
  );
}

export default Departments;