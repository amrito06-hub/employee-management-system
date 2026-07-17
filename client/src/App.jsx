import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import Departments from "./pages/Departments";
import Payroll from "./pages/Payroll";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Routes>

      {/* Login - Without Sidebar */}
      <Route
        path="/"
        element={<Login />}
      />

      {/* Main Application Layout */}
      <Route element={<MainLayout />}>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={<Employees />}
        />

        {/* Employee Details */}
        <Route
          path="/employees/:id"
          element={<EmployeeDetails />}
        />

        {/* Departments */}
        <Route
          path="/departments"
          element={<Departments />}
        />

        {/* Payroll */}
        <Route
          path="/payroll"
          element={<Payroll />}
        />

      </Route>

    </Routes>
  );
}

export default App;