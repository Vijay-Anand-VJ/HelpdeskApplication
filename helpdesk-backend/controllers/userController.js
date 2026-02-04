const User = require("../models/user");
const Log = require("../models/Log");
const bcrypt = require("bcryptjs"); // Ensure bcrypt is required if used explicitly

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        // 1. Fetch all users, sorted by newest first
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get user profile (Self)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update user profile (Self)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            // user.email = req.body.email || user.email; // Usually don't allow email change without verification

            if (req.body.newPass && req.body.currentPass) {
                if (await user.matchPassword(req.body.currentPass)) {
                    user.password = req.body.newPass;
                } else {
                    return res.status(400).json({ message: "Invalid current password" });
                }
            } else if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create a new user (Admin function)
 * @route   POST /api/users/add
 * @access  Private/Admin
 */
const createUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    try {
        // 1. Check uniqueness
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Create the user document
        const user = await User.create({
            name,
            email,
            password, // Will be hashed by pre-save middleware
            role,
            department,
        });

        if (user) {
            // 3. Log the creation event for audit trail
            if (req.user) {
                await Log.create({
                    action: `Created user: ${user.email}`,
                    user: req.user._id, // The Admin who performed the action
                    details: `Role: ${user.role}`
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update user profile or permissions (Admin)
 * @route   PUT /api/users/:id
 * @access  Private (Admin or Self)
 */
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // 1. Update basic fields if provided
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // 2. Handle Password Change
            if (req.body.password) {
                user.password = req.body.password;
            }

            // 3. Update Role/Dept (Only if allowed)
            if (req.body.role) user.role = req.body.role;
            if (req.body.department) user.department = req.body.department;
            if (req.body.status) user.status = req.body.status;

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Toggle User Status (Ban/Activate)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 1. Flip Status
        user.status = user.status === "Active" ? "Inactive" : "Active";
        await user.save();

        // 2. Audit Log
        await Log.create({
            action: `Changed status of ${user.email} to ${user.status}`,
            user: req.user._id,
            details: `User ID: ${user._id}`
        });

        res.status(200).json({ message: "User status updated", status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserProfile,
    updateUserProfile,
    createUser,
    updateUser,
    toggleUserStatus
};
