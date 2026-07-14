console.log("🚀 Server Index Loaded");

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");

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

console.log("✅ Registering Employee Routes...");

// Employee Routes
app.use("/api/employees", employeeRoutes);

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server started on PORT ${PORT}`);
});