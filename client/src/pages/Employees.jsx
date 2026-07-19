import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

function Employees() {
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "Active",
    profileImage: "",
  });

  // =========================
  // FETCH EMPLOYEES
  // =========================
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await API.get("/employees");

      setEmployees(response.data.employees || []);

      return response.data.employees || [];
    } catch (error) {
      console.error("Employees Load Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Employees Data Load Failed"
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORMAT DATE FOR INPUT
  // =========================
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (employee) => {
    setEditingId(employee._id);

    setFormData({
      employeeId: employee.employeeId || "",
      fullName: employee.fullName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      salary: employee.salary || "",
      joiningDate: formatDateForInput(
        employee.joiningDate
      ),
      status: employee.status || "Active",
      profileImage: employee.profileImage || "",
    });

    setShowForm(true);
  };

  // =========================
  // LOAD DATA (+ AUTO-OPEN EDIT IF REDIRECTED)
  // =========================
  useEffect(() => {
    const loadAndCheckEdit = async () => {
      const employeesList = await fetchEmployees();

      const editEmployeeId =
        location.state?.editEmployeeId;

      if (editEmployeeId) {
        const targetEmployee = employeesList.find(
          (employee) => employee._id === editEmployeeId
        );

        if (targetEmployee) {
          startEdit(targetEmployee);
        }

        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }
    };

    loadAndCheckEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // SEARCH EMPLOYEE
  // =========================
  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!searchTerm.trim()) {
        fetchEmployees();
        return;
      }

      const response = await API.get(
        `/employees/search?name=${searchTerm}`
      );

      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Employee Search Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Employee Search Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchEmployees();
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
      employeeId: "",
      fullName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      salary: "",
      joiningDate: "",
      status: "Active",
      profileImage: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // ADD / UPDATE EMPLOYEE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const employeeData = {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        salary: Number(formData.salary),
        status: formData.status,
      };

      if (formData.joiningDate) {
        employeeData.joiningDate = formData.joiningDate;
      }

      if (formData.profileImage) {
        employeeData.profileImage = formData.profileImage;
      }

      let response;

      if (editingId) {
        response = await API.put(
          `/employees/${editingId}`,
          employeeData
        );
      } else {
        response = await API.post(
          "/employees/add",
          employeeData
        );
      }

      alert(
        response.data.message ||
          (editingId
            ? "Employee Updated Successfully"
            : "Employee Added Successfully")
      );

      resetForm();

      fetchEmployees();
    } catch (error) {
      console.error("Save Employee Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Save Employee Failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE EMPLOYEE
  // =========================
  const handleDelete = async (employeeId, employeeName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${employeeName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(employeeId);

      const response = await API.delete(
        `/employees/${employeeId}`
      );

      alert(
        response.data.message ||
          "Employee Deleted Successfully"
      );

      fetchEmployees();
    } catch (error) {
      console.error("Delete Employee Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Delete Employee Failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Employees
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your employee records
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
        >
          {showForm ? "✖ Close Form" : "+ Add Employee"}
        </button>

      </div>

      {/* ADD / EDIT EMPLOYEE FORM */}
      {showForm && (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Edit Employee" : "Add Employee"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            {/* EMPLOYEE ID */}
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              readOnly={editingId !== null}
              required
              className={`px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                editingId !== null
                  ? "bg-gray-100 dark:bg-gray-600"
                  : "bg-white dark:bg-gray-700"
              }`}
            />

            {/* FULL NAME */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* PHONE */}
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* DEPARTMENT */}
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* DESIGNATION */}
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* SALARY */}
            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* JOINING DATE */}
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />

            {/* STATUS */}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* PROFILE IMAGE URL */}
            <input
              type="text"
              name="profileImage"
              placeholder="Profile Image URL (optional)"
              value={formData.profileImage}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 md:col-span-2"
            />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-5 py-3 rounded-lg font-semibold"
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                ? "✅ Update Employee"
                : "✅ Add Employee"}
            </button>

          </form>

        </div>

      )}

      {/* SEARCH BAR */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >

        <input
          type="text"
          placeholder="Search employee by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
        >
          🔍 Search
        </button>

        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold"
          >
            Clear
          </button>
        )}

      </form>

      {/* EMPLOYEE RECORDS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            Employee Records
          </h2>
        </div>

        {loading ? (

          <div className="p-8 text-center">
            Loading employees...
          </div>

        ) : employees.length === 0 ? (

          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No employees found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 dark:bg-gray-700">

                <tr>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>

              </thead>

              <tbody>

                {employees.map((employee) => (

                  <tr
                    key={employee._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >

                    <td className="p-4">
                      {employee.employeeId}
                    </td>

                    <td className="p-4 font-medium">
                      {employee.fullName}
                    </td>

                    <td className="p-4">
                      {employee.department}
                    </td>

                    <td className="p-4">
                      {employee.designation}
                    </td>

                    <td className="p-4">
                      ₹
                      {Number(
                        employee.salary || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          employee.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            navigate(
                              `/employees/${employee._id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          👁️ View
                        </button>

                        <button
                          onClick={() =>
                            startEdit(employee)
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              employee._id,
                              employee.fullName
                            )
                          }
                          disabled={
                            deletingId === employee._id
                          }
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          {deletingId === employee._id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

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

export default Employees;