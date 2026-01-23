const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  createUser,
  forgotPassword, // <--- Import
  resetPassword   // <--- Import
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // <--- New Route
router.put("/reset-password/:resetToken", resetPassword); // <--- New Route

// Admin Routes
router.route("/users")
  .get(protect, getUsers)
  .post(protect, createUser);

module.exports = router;