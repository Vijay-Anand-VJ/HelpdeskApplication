const mongoose = require("mongoose");

const logSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String, // e.g., "LOGIN", "REGISTER", "UPDATE_USER"
            required: true,
        },
        details: {
            type: String, // e.g., "Updated role to Admin"
        },
        ip: {
            type: String, // Optional: Capture IP address if available
        },
    },
    {
        timestamps: true, // Automatically manages createdAt
    }
);

module.exports = mongoose.model("Log", logSchema);
