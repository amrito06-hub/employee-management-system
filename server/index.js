console.log("🚀 Server Index Loaded");

const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load Environment Variables
dotenv.config();

// Create Express App
const app = express();

// Middleware
app.use(express.json());

// Connect MongoDB
connectDB();

// Home Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

console.log("✅ Registering Routes...");

// Employee Routes
app.use("/api/employees", employeeRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server started on PORT ${PORT}`);
});