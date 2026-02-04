const express = require("express");
const router = express.Router();
const { getArticles, createArticle } = require("../controllers/articleController");
const { protect } = require("../middleware/authMiddleware");

// Expanded helper to allow Super Admin, Admin, and Manager roles
const canManageArticles = (req, res, next) => {
    const allowedRoles = ["Super Admin", "Admin", "Manager"];

    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: "Not authorized to create articles" });
    }
};

router.route("/")
    .get(protect, getArticles) // All logged-in users can read
    .post(protect, canManageArticles, createArticle); // Restricted to specific roles

module.exports = router;
