const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        // Finds up to 10 latest notifications for the logged-in user
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications };
