import { useEffect, useMemo, useState } from "react";
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
  const [refreshing, setRefreshing] = useState(false);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    loadEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadEmployeeData = async () => {
    await Promise.all([
      getEmployeeDetails(),
      getPayrollHistory(),
    ]);
  };

  // =========================
  // GET EMPLOYEE DETAILS
  // =========================
  const getEmployeeDetails = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/employees/${id}`);

      setEmployee(res.data.employee || null);
    } catch (error) {
      console.log("Employee Details Error:", error);

      alert(
        error.response?.data?.message ||
          "Employee Details Load Failed"
      );

      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET PAYROLL HISTORY
  // =========================
  const getPayrollHistory = async () => {
    try {
      setLoadingPayroll(true);

      const res = await API.get("/payroll");

      const allPayrolls = res.data.payrolls || [];

      const employeePayrolls = allPayrolls.filter(
        (payroll) =>
          payroll.employee?._id === id ||
          payroll.employee === id
      );

      setPayrollHistory(employeePayrolls);
    } catch (error) {
      console.log("Payroll History Error:", error);

      setPayrollHistory([]);
    } finally {
      setLoadingPayroll(false);
    }
  };

  // =========================
  // REFRESH
  // =========================
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        getEmployeeDetails(),
        getPayrollHistory(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // DELETE EMPLOYEE
  // =========================
  const handleDelete = async () => {
    if (!employee) return;

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
      console.error(
        "Delete Employee Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Delete Employee Failed"
      );

      setDeleting(false);
    }
  };

  // =========================
  // PAYROLL STATISTICS
  // =========================
  const payrollStats = useMemo(() => {
    const totalPayrollAmount =
      payrollHistory.reduce(
        (total, payroll) =>
          total +
          Number(payroll.netSalary || 0),
        0
      );

    const totalSalaryPaid =
      payrollHistory
        .filter(
          (payroll) =>
            payroll.paymentStatus === "Paid"
        )
        .reduce(
          (total, payroll) =>
            total +
            Number(payroll.netSalary || 0),
          0
        );

    const pendingSalary =
      payrollHistory
        .filter(
          (payroll) =>
            payroll.paymentStatus === "Pending"
        )
        .reduce(
          (total, payroll) =>
            total +
            Number(payroll.netSalary || 0),
          0
        );

    const paidCount =
      payrollHistory.filter(
        (payroll) =>
          payroll.paymentStatus === "Paid"
      ).length;

    const pendingCount =
      payrollHistory.filter(
        (payroll) =>
          payroll.paymentStatus === "Pending"
      ).length;

    return {
      totalPayrollAmount,
      totalSalaryPaid,
      pendingSalary,
      paidCount,
      pendingCount,
    };
  }, [payrollHistory]);

  // =========================
  // INFO FIELDS
  // =========================
  const infoFields = employee
    ? [
        {
          icon: "🆔",
          label: "Employee ID",
          value: employee.employeeId,
        },
        {
          icon: "👤",
          label: "Full Name",
          value: employee.fullName,
        },
        {
          icon: "✉️",
          label: "Email",
          value: employee.email,
        },
        {
          icon: "📞",
          label: "Phone",
          value: employee.phone,
        },
        {
          icon: "🏢",
          label: "Department",
          value: employee.department,
        },
        {
          icon: "💼",
          label: "Designation",
          value: employee.designation,
        },
        {
          icon: "💰",
          label: "Monthly Salary",
          value: `₹ ${Number(
            employee.salary || 0
          ).toLocaleString("en-IN")}`,
          highlight: true,
        },
        {
          icon: "📅",
          label: "Joining Date",
          value: employee.joiningDate
            ? new Date(
                employee.joiningDate
              ).toLocaleDateString("en-IN")
            : "Not Available",
        },
      ]
    : [];

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 text-gray-900 dark:text-white">

        <div className="max-w-5xl mx-auto">

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">

            <div className="animate-pulse">

              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />

              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72 mx-auto" />

            </div>

            <p className="text-gray-500 dark:text-gray-400 mt-5">
              Loading employee details...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // NOT FOUND STATE
  // =========================
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 text-gray-900 dark:text-white">

        <div className="max-w-5xl mx-auto">

          <button
            onClick={() => navigate("/employees")}
            className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            ← Back to Employees
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">

            <div className="text-5xl mb-4">
              🔍
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Employee Not Found
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The employee details could not be found.
            </p>

            <button
              onClick={() => navigate("/employees")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Go to Employees
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 text-gray-900 dark:text-white">

      <div className="max-w-5xl mx-auto">

        {/* TOP NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <button
            onClick={() => navigate("/employees")}
            className="w-fit bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            ← Back to Employees
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-fit bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            {refreshing
              ? "Refreshing..."
              : "🔄 Refresh"}
          </button>

        </div>

        {/* EMPLOYEE HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 md:p-6 mb-6 border border-gray-100 dark:border-gray-700">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-center gap-4 min-w-0">

              {employee.profileImage ? (

                <img
                  src={employee.profileImage}
                  alt={employee.fullName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 flex-shrink-0"
                />

              ) : (

                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl md:text-3xl font-bold shadow-md flex-shrink-0">
                  {employee.fullName
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

              )}

              <div className="min-w-0">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white break-words">
                  {employee.fullName}
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-1 break-words">
                  {employee.designation || "N/A"}{" "}
                  •{" "}
                  {employee.department || "N/A"}
                </p>

                <span className="inline-block mt-2 text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  #{employee.employeeId}
                </span>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <span
                className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  employee.status === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                ● {employee.status}
              </span>

              <button
                onClick={() =>
                  navigate("/employees", {
                    state: {
                      editEmployeeId:
                        employee._id,
                    },
                  })
                }
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                ✏️ Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                {deleting
                  ? "Deleting..."
                  : "🗑️ Delete"}
              </button>

            </div>

          </div>

        </div>

        {/* EMPLOYEE INFORMATION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 md:p-6 mb-6 border border-gray-100 dark:border-gray-700">

          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">
            Employee Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {infoFields.map((field) => (

              <div
                key={field.label}
                className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 min-w-0"
              >

                <span className="text-xl flex-shrink-0">
                  {field.icon}
                </span>

                <div className="min-w-0">

                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {field.label}
                  </p>

                  <p
                    className={`font-semibold break-words ${
                      field.highlight
                        ? "text-green-600 dark:text-green-400 text-lg"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {field.value || "Not Available"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* PAYROLL SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              💵 Total Payroll
            </p>

            <h2 className="text-2xl font-bold mt-2">
              ₹
              {payrollStats.totalPayrollAmount.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ✅ Salary Paid
            </p>

            <h2 className="text-2xl font-bold mt-2 text-green-500">
              ₹
              {payrollStats.totalSalaryPaid.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ⏳ Pending Salary
            </p>

            <h2 className="text-2xl font-bold mt-2 text-orange-500">
              ₹
              {payrollStats.pendingSalary.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              🧾 Payroll Records
            </p>

            <h2 className="text-3xl font-bold mt-2 text-blue-500">
              {payrollHistory.length}
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {payrollStats.paidCount} Paid •{" "}
              {payrollStats.pendingCount} Pending
            </p>

          </div>

        </div>

        {/* PAYROLL HISTORY */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">

          <div className="p-5 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <h2 className="text-xl font-bold">
              Payroll History
            </h2>

            <button
              onClick={() => navigate("/payroll")}
              className="w-fit text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm"
            >
              View All Payroll →
            </button>

          </div>

          {loadingPayroll ? (

            <div className="p-8 text-center">

              <div className="animate-pulse text-gray-500 dark:text-gray-400">
                Loading payroll history...
              </div>

            </div>

          ) : payrollHistory.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-5xl mb-4">
                🧾
              </div>

              <p className="text-gray-500 dark:text-gray-400">
                No payroll records found for this employee.
              </p>

              <button
                onClick={() => navigate("/payroll")}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Generate Payroll
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left min-w-[650px]">

                <thead className="bg-gray-50 dark:bg-gray-700">

                  <tr>

                    <th className="p-4">
                      Month
                    </th>

                    <th className="p-4">
                      Basic Salary
                    </th>

                    <th className="p-4">
                      Net Salary
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Payment Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {payrollHistory.map((payroll) => (

                    <tr
                      key={payroll._id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >

                      <td className="p-4">
                        {payroll.month || "-"}
                      </td>

                      <td className="p-4">
                        ₹
                        {Number(
                          payroll.basicSalary || 0
                        ).toLocaleString("en-IN")}
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
                          {payroll.paymentStatus ||
                            "Pending"}
                        </span>

                      </td>

                      <td className="p-4">

                        {payroll.paymentDate
                          ? new Date(
                              payroll.paymentDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
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

    </div>
  );
}

export default EmployeeDetails;