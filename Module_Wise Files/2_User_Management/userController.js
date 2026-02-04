const User = require("../models/user");
const Log = require("../models/Log");

// @desc    Get all users (Admin only)
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); // Don't send passwords back!
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
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

const generateToken = require("../utils/generateToken");

// @desc    Update user profile
// @route   PUT /api/users/profile
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
                token: generateToken(updatedUser._id), // Optional: refresh token
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
const createUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Admin can set the role directly
        const user = await User.create({
            name,
            email,
            password,
            role,
            department
        });

        if (user) {
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

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.department = req.body.department || user.department;

            const updatedUser = await user.save();

            // Log Update
            await Log.create({ user: req.user._id, action: "UPDATE_USER", details: `Updated user ${updatedUser.email} (Role: ${updatedUser.role})` });

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

// @desc    Deactivate/Activate user (Admin only)
// @route   PUT /api/users/:id/deactivate
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isActive = !user.isActive;

            await user.save();
            res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    getUserProfile,
    updateUserProfile
};
