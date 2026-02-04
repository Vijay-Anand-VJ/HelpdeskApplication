const cron = require("node-cron");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const sendEmail = require("./sendEmail"); // Helper for NodeMailer

/**
 * @desc    Initializes the SLA Monitor
 *          Runs every 1 minute to check for overdue tickets.
 */
const initSLAScheduler = () => {
    // Cron Schedule: * * * * * (Every Minute)
    cron.schedule("* * * * *", async () => {
        // console.log("⏰ Running SLA Check...");
        const now = new Date();

        try {
            // 1. Find Breached Tickets
            // Criteria:
            // - Status is NOT closed/resolved
            // - Due Date has passed
            // - Has NOT already been marked as breached
            const tickets = await Ticket.find({
                status: { $in: ["Open", "In Progress"] },
                dueDate: { $lt: now },
                isBreached: { $ne: true }
            }).populate('user').populate('assignedTo');

            // 2. Process Escalations
            for (const ticket of tickets) {
                console.log(`⚠️ SLA Breach Detected: Ticket #${ticket._id}`);

                // A. Update Ticket State
                ticket.isBreached = true;
                ticket.priority = "Critical"; // Auto-escalate priority
                ticket.history.push({
                    action: "SLA BREACHED",
                    user: "SYSTEM", // Placeholder for system action
                    timestamp: new Date(),
                    details: "Ticket exceeded due date. Priority escalated to Critical."
                });
                await ticket.save();

                // B. Notify the Ticket Owner (Customer)
                await Notification.create({
                    user: ticket.user._id,
                    message: `Your ticket #${ticket._id} has been flagged for SLA breach. Priority escalated.`,
                    type: "error" // Red alert
                });

                // C. Notify the Assignee (Agent), if one exists
                if (ticket.assignedTo) {
                    await Notification.create({
                        user: ticket.assignedTo._id,
                        message: `URGENT: Ticket #${ticket._id} assigned to you has breached SLA!`,
                        type: "error"
                    });
                }
            }
        } catch (error) {
            console.error("❌ SLA Scheduler Error:", error);
        }
    });
};

module.exports = initSLAScheduler;
