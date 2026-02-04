const express = require("express");
const router = express.Router();
console.log("Auth Routes Module Loaded");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getLogs
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // <--- New Route
router.put("/reset-password/:resetToken", resetPassword); // <--- New Route

router.get("/logs", protect, admin, getLogs); // <--- New Route (Moved Up)

module.exports = router;