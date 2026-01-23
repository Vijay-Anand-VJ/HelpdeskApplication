const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const articleRoutes = require("./routes/articleRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Helps with form data

// Use Routes
app.use("/api/auth", authRoutes); 
app.use("/api/users", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/articles", articleRoutes);
// Serve Uploads (Make sure this folder exists!)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- ADD THIS ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message); // Log error to terminal
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});
// ------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});