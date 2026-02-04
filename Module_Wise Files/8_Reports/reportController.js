const Ticket = require("../models/Ticket");

// @desc    Get Ticket Statistics for Reports
// @route   GET /api/tickets/stats
// It is extracted here to represent the "Reporting" module responsibilities.
const getTicketStats = async (req, res) => {
    try {
        const tickets = await Ticket.find({});

        const statusData = {
            open: tickets.filter((t) => t.status === "Open").length,
            inProgress: tickets.filter((t) => t.status === "In Progress").length,
            closed: tickets.filter((t) => t.status === "Closed").length,
            resolved: tickets.filter((t) => t.status === "Resolved").length,
        };

        const priorityData = {
            low: tickets.filter((t) => t.priority === "Low").length,
            medium: tickets.filter((t) => t.priority === "Medium").length,
            high: tickets.filter((t) => t.priority === "High").length,
            critical: tickets.filter((t) => t.priority === "Critical").length,
        };

        const categoryData = tickets.reduce((acc, ticket) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
        }, {});

        res.json({
            total: tickets.length,
            status: statusData,
            priority: priorityData,
            category: categoryData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTicketStats
};
