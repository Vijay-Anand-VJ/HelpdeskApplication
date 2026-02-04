const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header (looks like "Bearer eyJhbGciOi...")
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token ID (exclude password)
            req.user = await User.findById(decoded.id).select("-password");

            // Check if user exists
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next(); // Move to the next step
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && ["Admin", "Super Admin", "Manager"].includes(req.user.role)) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };
