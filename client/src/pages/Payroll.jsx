import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Payroll() {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    employee: "",
    month: "",
    basicSalary: "",
    allowance: "",
    bonus: "",
    deduction: "",
  });

  // =========================
  // FETCH PAYROLLS
  // =========================
  const fetchPayrolls = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await API.get("/payroll");

      setPayrolls(response.data.payrolls || []);
    } catch (error) {
      console.error("Payroll Load Error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Payroll Data Load Failed";

      setError(message);

      if (!isRefresh) {
        alert(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // FETCH EMPLOYEES
  // =========================
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Employees Load Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Employees Data Load Failed"
      );
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  // =========================
  // REFRESH ALL DATA
  // =========================
  const handleRefresh = async () => {
    await Promise.all([
      fetchPayrolls(true),
      fetchEmployees(),
    ]);
  };

  // =========================
  // EMPLOYEE SELECT
  // =========================
  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;

    const selectedEmployee = employees.find(
      (employee) => employee._id === employeeId
    );

    setFormData((previousData) => ({
      ...previousData,
      employee: employeeId,
      basicSalary: selectedEmployee
        ? selectedEmployee.salary
        : "",
    }));
  };

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      employee: "",
      month: "",
      basicSalary: "",
      allowance: "",
      bonus: "",
      deduction: "",
    });

    setShowForm(false);
  };

  // =========================
  // NET SALARY
  // =========================
  const netSalary =
    Number(formData.basicSalary || 0) +
    Number(formData.allowance || 0) +
    Number(formData.bonus || 0) -
    Number(formData.deduction || 0);

  // =========================
  // GENERATE PAYROLL
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payrollData = {
        employee: formData.employee,
        month: formData.month,
        basicSalary: Number(formData.basicSalary),
        allowance: Number(formData.allowance || 0),
        bonus: Number(formData.bonus || 0),
        deduction: Number(formData.deduction || 0),
      };

      const response = await API.post(
        "/payroll/create",
        payrollData
      );

      alert(
        response.data.message ||
          "Payroll Generated Successfully"
      );

      resetForm();

      await fetchPayrolls();
    } catch (error) {
      console.error(
        "Payroll Generate Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Payroll Generate Failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // MARK AS PAID
  // =========================
  const handleMarkAsPaid = async (payrollId) => {
    const confirmPayment = window.confirm(
      "Are you sure you want to mark this payroll as Paid?"
    );

    if (!confirmPayment) {
      return;
    }

    try {
      setPayingId(payrollId);

      const response = await API.put(
        `/payroll/${payrollId}/pay`
      );

      alert(
        response.data.message ||
          "Payroll marked as Paid"
      );

      await fetchPayrolls();
    } catch (error) {
      console.error(
        "Mark Paid Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark payroll as Paid"
      );
    } finally {
      setPayingId(null);
    }
  };

  // =========================
  // FILTER PAYROLLS
  // =========================
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((payroll) => {
      const searchText = search.toLowerCase().trim();

      const employeeName =
        payroll.employee?.fullName?.toLowerCase() || "";

      const employeeId =
        payroll.employee?.employeeId?.toLowerCase() || "";

      const department =
        payroll.employee?.department?.toLowerCase() || "";

      const matchesSearch =
        employeeName.includes(searchText) ||
        employeeId.includes(searchText) ||
        department.includes(searchText);

      const matchesMonth =
        monthFilter === "" ||
        payroll.month === monthFilter;

      const matchesStatus =
        statusFilter === "All" ||
        payroll.paymentStatus === statusFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesStatus
      );
    });
  }, [
    payrolls,
    search,
    monthFilter,
    statusFilter,
  ]);

  // =========================
  // STATISTICS
  // =========================
  const totalSalary = payrolls.reduce(
    (total, payroll) =>
      total + Number(payroll.netSalary || 0),
    0
  );

  const paidSalary = payrolls
    .filter(
      (payroll) =>
        payroll.paymentStatus === "Paid"
    )
    .reduce(
      (total, payroll) =>
        total + Number(payroll.netSalary || 0),
      0
    );

  const pendingSalary = payrolls
    .filter(
      (payroll) =>
        payroll.paymentStatus === "Pending"
    )
    .reduce(
      (total, payroll) =>
        total + Number(payroll.netSalary || 0),
      0
    );

  const paidPayments = payrolls.filter(
    (payroll) =>
      payroll.paymentStatus === "Paid"
  ).length;

  const pendingPayments = payrolls.filter(
    (payroll) =>
      payroll.paymentStatus === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-white">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Payroll & Salary
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Manage employee salaries, payments and payroll records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "🔄 Refresh"}
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              {showForm
                ? "✖ Close Form"
                : "+ Generate Payroll"}
            </button>

          </div>

        </div>

        {/* GENERATE PAYROLL FORM */}
        {showForm && (

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Generate Payroll
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Create a salary record for an employee.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="text-slate-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* EMPLOYEE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employee
                </label>

                <select
                  value={formData.employee}
                  onChange={handleEmployeeChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.fullName} -{" "}
                      {employee.employeeId}
                    </option>
                  ))}
                </select>
              </div>

              {/* MONTH */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payroll Month
                </label>

                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* BASIC SALARY */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Basic Salary
                </label>

                <input
                  type="number"
                  name="basicSalary"
                  placeholder="Basic Salary"
                  value={formData.basicSalary}
                  readOnly
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 outline-none"
                />
              </div>

              {/* ALLOWANCE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Allowance
                </label>

                <input
                  type="number"
                  name="allowance"
                  placeholder="Allowance"
                  value={formData.allowance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* BONUS */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bonus
                </label>

                <input
                  type="number"
                  name="bonus"
                  placeholder="Bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DEDUCTION */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deduction
                </label>

                <input
                  type="number"
                  name="deduction"
                  placeholder="Deduction"
                  value={formData.deduction}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* NET SALARY */}
              <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-5">

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Net Salary
                </p>

                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₹{netSalary.toLocaleString("en-IN")}
                </h3>

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={saving}
                className="md:col-span-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-500 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                {saving
                  ? "Generating..."
                  : "✅ Generate Payroll"}
              </button>

            </form>

          </div>

        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div
            onClick={() => {
              setStatusFilter("All");
              setSearch("");
              setMonthFilter("");
            }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
          >
            <p className="text-slate-500 dark:text-slate-400">
              Total Payroll Records
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {payrolls.length}
            </h2>
          </div>

          <div
            onClick={() => navigate("/payroll")}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
          >
            <p className="text-slate-500 dark:text-slate-400">
              Total Payroll Amount
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-blue-600 dark:text-blue-400 break-words">
              ₹{totalSalary.toLocaleString("en-IN")}
            </h2>
          </div>

          <div
            onClick={() => setStatusFilter("Paid")}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
          >
            <p className="text-slate-500 dark:text-slate-400">
              Paid Salary
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-green-600 dark:text-green-400 break-words">
              ₹{paidSalary.toLocaleString("en-IN")}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {paidPayments} paid records
            </p>
          </div>

          <div
            onClick={() => setStatusFilter("Pending")}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
          >
            <p className="text-slate-500 dark:text-slate-400">
              Pending Salary
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-orange-500 break-words">
              ₹{pendingSalary.toLocaleString("en-IN")}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {pendingPayments} pending records
            </p>
          </div>

        </div>

        {/* ERROR STATE */}
        {error && (

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <span>
              {error}
            </span>

            <button
              onClick={() => fetchPayrolls()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>

          </div>

        )}

        {/* SEARCH AND FILTERS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-semibold">
              Search & Filters
            </h2>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filteredPayrolls.length} results
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Search employee, ID or department..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="month"
              value={monthFilter}
              onChange={(e) =>
                setMonthFilter(e.target.value)
              }
              className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">
                All Payment Status
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Pending">
                Pending
              </option>
            </select>

          </div>

          {(search ||
            monthFilter ||
            statusFilter !== "All") && (

            <button
              onClick={() => {
                setSearch("");
                setMonthFilter("");
                setStatusFilter("All");
              }}
              className="mt-4 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
            >
              Clear Filters
            </button>

          )}

        </div>

        {/* PAYROLL RECORDS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <div>
              <h2 className="text-xl font-semibold">
                Payroll Records
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage and track all employee salary payments.
              </p>
            </div>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredPayrolls.length} of{" "}
              {payrolls.length}
            </span>

          </div>

          {loading ? (

            <div className="p-10 text-center">

              <div className="animate-pulse space-y-3">

                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />

                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto" />

                <p className="text-slate-500 dark:text-slate-400 pt-2">
                  Loading payroll records...
                </p>

              </div>

            </div>

          ) : filteredPayrolls.length === 0 ? (

            <div className="p-12 text-center">

              <div className="text-5xl mb-4">
                🧾
              </div>

              <h3 className="text-lg font-semibold">
                No payroll records found
              </h3>

              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Try changing your filters or generate a new payroll.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead className="bg-slate-100 dark:bg-slate-700">

                  <tr>

                    <th className="p-4">
                      Employee
                    </th>

                    <th className="p-4">
                      Department
                    </th>

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

                    <th className="p-4">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPayrolls.map((payroll) => (

                    <tr
                      key={payroll._id}
                      className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >

                      <td className="p-4">

                        <button
                          onClick={() => {
                            if (payroll.employee?._id) {
                              navigate(
                                `/employees/${payroll.employee._id}`
                              );
                            }
                          }}
                          className="text-left"
                        >

                          <p className="font-semibold hover:text-blue-600 transition">
                            {payroll.employee?.fullName ||
                              "N/A"}
                          </p>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {payroll.employee?.employeeId ||
                              "N/A"}
                          </p>

                        </button>

                      </td>

                      <td className="p-4">
                        {payroll.employee?.department ||
                          "N/A"}
                      </td>

                      <td className="p-4">
                        {payroll.month || "-"}
                      </td>

                      <td className="p-4">
                        ₹
                        {Number(
                          payroll.basicSalary || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">
                        ₹
                        {Number(
                          payroll.netSalary || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            payroll.paymentStatus ===
                            "Paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
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

                      <td className="p-4">

                        {payroll.paymentStatus ===
                        "Pending" ? (

                          <button
                            onClick={() =>
                              handleMarkAsPaid(
                                payroll._id
                              )
                            }
                            disabled={
                              payingId === payroll._id
                            }
                            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                          >
                            {payingId ===
                            payroll._id
                              ? "Processing..."
                              : "Mark as Paid"}
                          </button>

                        ) : (

                          <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                            ✓ Paid
                          </span>

                        )}

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

export default Payroll;