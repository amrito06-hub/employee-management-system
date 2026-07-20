import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import Departments from "./pages/Departments";
import Payroll from "./pages/Payroll";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* EMPLOYEES */}
        <Route path="/employees" element={<Employees />} />

        <Route
          path="/employees/:id"
          element={<EmployeeDetails />}
        />

        {/* DEPARTMENTS */}
        <Route
          path="/departments"
          element={<Departments />}
        />

        {/* PAYROLL */}
        <Route
          path="/payroll"
          element={<Payroll />}
        />

        {/* INVALID ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;