const User = require("../models/user");
const Log = require("../models/Log"); // Import Log Model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// Removed: const generateToken = require("../utils/generateToken"); // generateToken is now defined locally

/**
 * @desc    Generate a JSON Web Token (JWT)
 * @param   {string} id - The user ID to embed in the token
 * @returns {string} - Signed JWT token valid for 30 days
 */
const generateToken = (id) => {
  // Sign the JWT with the user ID and a secret, setting an expiration
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body; // Removed 'role' from destructuring as it's forced to 'Customer'

  // 1. Validation: Ensure all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please include all fields" });
  }

  try {
    // 2. Check for Duplicates: Ensure email is unique
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create User: Password hashing is handled by the Mongoose 'pre-save' middleware in the User model
    const user = await User.create({
      name,
      email,
      password,
      role: "Customer", // FORCE role to Customer. Admin can change it later manually.
    });

    // 4. Response: Return user details and a JWT token upon successful registration
    if (user) {
      // Log Registration
      await Log.create({ user: user._id, action: "REGISTER", details: `New user registered: ${email}` });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Generate JWT for the new user
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message + " || STACK: " + error.stack });
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find User by Email
    const user = await User.findOne({ email });

    // 2. Verify Password: Compare plaintext input with hashed DB password using the User model's method
    if (user && (await user.matchPassword(password))) {
      // Log Login
      await Log.create({ user: user._id, action: "LOGIN", details: "User logged in successfully" });

      // 3. Success Response: Return user details and a JWT token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Generate JWT for the authenticated user
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// @desc    Forgot Password (Send Email)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Generate Token (Not JWT, just a random string)
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 2. Hash it and save to DB (Security best practice)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3. Set Expiry (10 Minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 4. Send Email
    // In real app: Link to Frontend (e.g., http://localhost:5173/reset-password/TOKEN)
    const message = `You requested a password reset. Use this token to reset your password: ${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
const resetPassword = async (req, res) => {
  const { password } = req.body;

  // Hash the token sent in the URL to compare with DB
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Check if not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password (User model will hash it automatically due to pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/auth/logs
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getLogs
};