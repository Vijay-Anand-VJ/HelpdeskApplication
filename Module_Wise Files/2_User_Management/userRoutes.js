const express = require("express");
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
    .get(protect, admin, getUsers)
    .post(protect, admin, createUser);

router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route("/:id/deactivate")
    .put(protect, admin, toggleUserStatus);

router.route("/:id")
    .put(protect, admin, updateUser);

module.exports = router;
