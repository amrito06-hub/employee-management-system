require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

app.use(express.json());

// Database
connectDB();

// Home Route
app.get("/", (req, res) => {
  res.send(
    "Employee Management System Server is Running"
  );
});

// Admin Routes (Login / Register)
app.use(
  "/api/admin",
  adminRoutes
);

// Employee Routes
app.use(
  "/api/employees",
  employeeRoutes
);

// Payroll Routes
app.use(
  "/api/payroll",
  payrollRoutes
);

// Dashboard Routes
app.use(
  "/api/dashboard",
  dashboardRoutes
);

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});