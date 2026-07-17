import { useEffect, useState } from "react";
import API from "../services/api";

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const [formData, setFormData] = useState({
    employee: "",
    month: "",
    basicSalary: "",
    allowance: "",
    bonus: "",
    deduction: "",
  });

  // Get Payrolls
  const fetchPayrolls = async () => {
    try {
      const response = await API.get("/payroll");

      setPayrolls(response.data.payrolls || []);
    } catch (error) {
      console.error("Payroll Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get Employees
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
    }
  };

  // Load Data
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  // Employee Select
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

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Net Salary
  const netSalary =
    Number(formData.basicSalary || 0) +
    Number(formData.allowance || 0) +
    Number(formData.bonus || 0) -
    Number(formData.deduction || 0);

  // Generate Payroll
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await API.post("/payroll", {
        employee: formData.employee,
        month: formData.month,
        basicSalary: Number(formData.basicSalary),
        allowance: Number(formData.allowance || 0),
        bonus: Number(formData.bonus || 0),
        deduction: Number(formData.deduction || 0),
      });

      alert(
        response.data.message ||
          "Payroll Generated Successfully"
      );

      setFormData({
        employee: "",
        month: "",
        basicSalary: "",
        allowance: "",
        bonus: "",
        deduction: "",
      });

      setShowForm(false);

      fetchPayrolls();
    } catch (error) {
      console.error("Payroll Generate Error:", error);

      alert(
        error.response?.data?.message ||
          "Payroll Generate Failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark Payroll as Paid
  const handleMarkAsPaid = async (payrollId) => {
    try {
      setPayingId(payrollId);

      const response = await API.put(
        `/payroll/${payrollId}/pay`
      );

      alert(
        response.data.message ||
          "Payroll marked as Paid"
      );

      fetchPayrolls();
    } catch (error) {
      console.error("Mark Paid Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to mark payroll as Paid"
      );
    } finally {
      setPayingId(null);
    }
  };

  // Statistics
  const totalSalary = payrolls.reduce(
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Payroll & Salary
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage employee salaries and payroll
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(!showForm)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
        >
          {showForm
            ? "✖ Close Form"
            : "+ Generate Payroll"}
        </button>

      </div>

      {/* Generate Payroll Form */}
      {showForm && (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-6">
            Generate Payroll
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            {/* Employee */}
            <select
              value={formData.employee}
              onChange={handleEmployeeChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
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

            {/* Month */}
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* Basic Salary */}
            <input
              type="number"
              name="basicSalary"
              placeholder="Basic Salary"
              value={formData.basicSalary}
              readOnly
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
            />

            {/* Allowance */}
            <input
              type="number"
              name="allowance"
              placeholder="Allowance"
              value={formData.allowance}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* Bonus */}
            <input
              type="number"
              name="bonus"
              placeholder="Bonus"
              value={formData.bonus}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* Deduction */}
            <input
              type="number"
              name="deduction"
              placeholder="Deduction"
              value={formData.deduction}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* Net Salary */}
            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">

              <p className="text-gray-500 dark:text-gray-400">
                Net Salary
              </p>

              <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{netSalary.toLocaleString("en-IN")}
              </h3>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-5 py-3 rounded-lg font-semibold"
            >
              {saving
                ? "Generating..."
                : "✅ Generate Payroll"}
            </button>

          </form>

        </div>

      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">
            Total Payroll
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {payrolls.length}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">
            Total Salary
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{totalSalary.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">
            Paid
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-500">
            {paidPayments}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">
            Pending
          </p>

          <h2 className="text-3xl font-bold mt-2 text-orange-500">
            {pendingPayments}
          </h2>
        </div>

      </div>

      {/* Payroll Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            Payroll Records
          </h2>
        </div>

        {loading ? (

          <div className="p-8 text-center">
            Loading payroll records...
          </div>

        ) : payrolls.length === 0 ? (

          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No payroll records found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 dark:bg-gray-700">

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
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {payrolls.map((payroll) => (

                  <tr
                    key={payroll._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >

                    <td className="p-4 font-medium">
                      {payroll.employee?.fullName ||
                        "N/A"}
                    </td>

                    <td className="p-4">
                      {payroll.employee?.department ||
                        "N/A"}
                    </td>

                    <td className="p-4">
                      {payroll.month}
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
                        {payroll.paymentStatus}
                      </span>

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
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          {payingId ===
                          payroll._id
                            ? "Processing..."
                            : "Mark as Paid"}
                        </button>

                      ) : (

                        <span className="text-green-600 dark:text-green-400 font-medium">
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
  );
}

export default Payroll;