const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ["Technical", "Hardware", "Network", "Access", "Server", "HR"]
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium"
        },
        // Add this to your Ticket schema in models/Ticket.js
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Closed"],
            default: "Open"
        },
        attachment: { type: String }, // File Path

        // NEW FIELD: Stores the deadline
        dueDate: { type: Date },

        // SLA Flag
        isBreached: { type: Boolean, default: false }
    },
    { timestamps: true }
);
module.exports = mongoose.model("Ticket", ticketSchema);
