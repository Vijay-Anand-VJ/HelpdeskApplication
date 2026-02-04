const mongoose = require("mongoose");

/**
 * @desc Ticket Schema
 * Represents a support request. Links to User and assigned Agent.
 */
const ticketSchema = mongoose.Schema(
  {
    // Link to the Customer (Creator)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please select a ticket issue"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description of the issue"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Technical", "Hardware", "Software", "Access", "General", "HR", "Finance"],
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed", "Resolved"], // Valid States
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"], // Drives SLA logic
      default: "Medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Link to Agent/Manager
      default: null,
    },
    attachment: {
      type: String, // Stores the file path relative to /uploads directory
      default: null,
    },
    dueDate: {
      type: Date, // Calculated based on Priority by ticketController
    },
    isBreached: {
      type: Boolean, // Flag for SLA Scheduler
      default: false,
    },
    // Audit Trail / Activity Log specific to this ticket
    history: [
      {
        action: String, // e.g., "STATUS CHANGE"
        user: String,   // User Name or "SYSTEM"
        timestamp: { type: Date, default: Date.now },
        details: String
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);