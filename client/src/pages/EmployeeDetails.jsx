import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EmployeeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loadingPayroll, setLoadingPayroll] = useState(true);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getEmployeeDetails();
    getPayrollHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================
  // GET EMPLOYEE DETAILS
  // =========================
  const getEmployeeDetails = async () => {
    try {
      const res = await API.get(`/employees/${id}`);

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

  // =========================
  // GET PAYROLL HISTORY (filtered for this employee)
  // =========================
  const getPayrollHistory = async () => {
    try {
      const res = await API.get("/payroll");

      const allPayrolls = res.data.payrolls || [];

      const employeePayrolls = allPayrolls.filter(
        (payroll) => payroll.employee?._id === id
      );

      setPayrollHistory(employeePayrolls);
    } catch (error) {
      console.log("Payroll History Error:", error);
    } finally {
      setLoadingPayroll(false);
    }
  };

  // =========================
  // DELETE EMPLOYEE
  // =========================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${employee.fullName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(true);

      const response = await API.delete(
        `/employees/${id}`
      );

      alert(
        response.data.message ||
          "Employee Deleted Successfully"
      );

      navigate("/employees");
    } catch (error) {
      console.error("Delete Employee Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Delete Employee Failed"
      );

      setDeleting(false);
    }
  };

  // =========================
  // PAYROLL STATS
  // =========================
  const totalSalaryPaid = payrollHistory
    .filter(
      (payroll) => payroll.paymentStatus === "Paid"
    )
    .reduce(
      (total, payroll) =>
        total + Number(payroll.netSalary || 0),
      0
    );

  const pendingPayrollCount = payrollHistory.filter(
    (payroll) => payroll.paymentStatus === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 text-gray-900 dark:text-white">

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

              <div className="flex items-center gap-4">

                {employee.profileImage ? (
                  <img
                    src={employee.profileImage}
                    alt={employee.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                    {employee.fullName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {employee.fullName}
                  </h1>

                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {employee.designation}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    employee.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {employee.status}
                </span>

                <button
                  onClick={() =>
                    navigate("/employees", {
                      state: {
                        editEmployeeId: employee._id,
                      },
                    })
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium"
                >
                  {deleting ? "Deleting..." : "🗑️ Delete"}
                </button>

              </div>

            </div>

          </div>

          {/* Employee Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">

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

          {/* Payroll Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Total Salary Paid
              </p>
              <h2 className="text-3xl font-bold mt-2 text-green-500">
                ₹
                {totalSalaryPaid.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Pending Payroll
              </p>
              <h2 className="text-3xl font-bold mt-2 text-orange-500">
                {pendingPayrollCount}
              </h2>
            </div>

          </div>

          {/* Payroll History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">

            <div className="p-5 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                Payroll History
              </h2>
            </div>

            {loadingPayroll ? (

              <div className="p-8 text-center">
                Loading payroll history...
              </div>

            ) : payrollHistory.length === 0 ? (

              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No payroll records found for this employee.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-4">Month</th>
                      <th className="p-4">Net Salary</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payment Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {payrollHistory.map((payroll) => (

                      <tr
                        key={payroll._id}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >

                        <td className="p-4">
                          {payroll.month}
                        </td>

                        <td className="p-4 font-semibold">
                          ₹
                          {Number(
                            payroll.netSalary || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              payroll.paymentStatus ===
                              "Paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            }`}
                          >
                            {payroll.paymentStatus}
                          </span>
                        </td>

                        <td className="p-4">
                          {payroll.paymentDate
                            ? new Date(
                                payroll.paymentDate
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default EmployeeDetails;