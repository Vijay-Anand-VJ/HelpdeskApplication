const cron = require("node-cron");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const Note = require("../models/Note");

// Run every minute
const initSLAScheduler = () => {
    cron.schedule("* * * * *", async () => {
        // console.log("Running SLA Breach Check...");
        try {
            const now = new Date();

            // Find tickets that are OPEN or IN PROGRESS
            // AND have passed their due date
            // AND are NOT yet marked as breached per DB flag
            const tickets = await Ticket.find({
                status: { $in: ["Open", "In Progress"] },
                dueDate: { $lt: now },
                isBreached: { $ne: true }
            });

            for (const ticket of tickets) {
                console.log(`Processing SLA Breach for Ticket #${ticket._id}`);

                // 1. Mark as Breached & Escalate Priority
                ticket.isBreached = true;
                if (ticket.priority !== "Critical") {
                    ticket.priority = "Critical";
                }
                await ticket.save();

                // 2. Add System Note (Audit Trail)
                await Note.create({
                    ticket: ticket._id,
                    user: ticket.user, // Technically system, but linking to owner for ref
                    content: "⚠️ SYSTEM ALERT: SLA Breached. Priority escalated to Critical.",
                    isInternal: true
                });

                // 3. Create Notification for Assignee/Owner
                const recipient = ticket.assignedTo ? ticket.assignedTo : ticket.user;

                await Notification.create({
                    user: recipient,
                    message: `SLA Breach Detected for Ticket #${ticket._id}. Priority escalated.`,
                    type: "alert",
                    ticket: ticket._id,
                });
            }
        } catch (error) {
            console.error("SLA Scheduler Error:", error);
        }
    });
};

module.exports = initSLAScheduler;
