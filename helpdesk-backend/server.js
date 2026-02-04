const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Import User Routes
const ticketRoutes = require("./routes/ticketRoutes");
const articleRoutes = require("./routes/articleRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // Ensure notificationRoutes.js exists

const initSLAScheduler = require("./utils/slaScheduler"); // Import Scheduler

dotenv.config();
connectDB();
initSLAScheduler(); // <--- Start the Cron Job

const app = express();

// Middleware
// Middleware
app.use(cors({
  origin: "*", // Keep it open for local dev, or specify "http://localhost:5173"
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Routes
console.log("Mounting Auth Routes at /api/auth and /api/users");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Maps requests to User Routes
app.use("/api/tickets", ticketRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/notifications", notificationRoutes); // FIXED: No more 404s for notifications

// Serve Uploads - Allows the frontend to display ticket attachments
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});