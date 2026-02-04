const Ticket = require("../models/Ticket");
const User = require("../models/user");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// @desc    Get user tickets
// @route   GET /api/tickets
const getTickets = async (req, res) => {
    try {
        let tickets;
        // Role-based scoping: Customers see only their own, Staff see all
        if (req.user.role === "Customer") {
            tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        } else {
            tickets = await Ticket.find().sort({ createdAt: -1 });
        }
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new ticket
// @route   POST /api/tickets
const createTicket = async (req, res) => {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ message: "Please include all fields" });
    }

    try {
        // 1. Calculate Due Date (SLA Logic)
        let dueDate = new Date();
        if (priority === "Low") dueDate.setHours(dueDate.getHours() + 48);
        else if (priority === "Medium") dueDate.setHours(dueDate.getHours() + 24);
        else if (priority === "High") dueDate.setHours(dueDate.getHours() + 4);
        else if (priority === "Critical") dueDate.setHours(dueDate.getHours() + 1);

        const attachmentPath = req.file ? req.file.path : null;

        // 2. Create Ticket in Database
        const ticket = await Ticket.create({
            title,
            description,
            category,
            priority,
            user: req.user._id,
            status: "Open",
            attachment: attachmentPath,
            dueDate: dueDate,
        });

        // 3. TRIGGER: In-App Notification
        await Notification.create({
            user: req.user.id,
            message: `Your ticket "${ticket.title}" has been successfully created.`,
            type: "success"
        });

        // 4. TRIGGER: Email Notification
        try {
            const userDetails = await User.findById(req.user.id);
            await sendEmail({
                email: userDetails.email,
                subject: `Ticket Created: #${ticket._id.toString().slice(-6)}`,
                message: `Hello ${userDetails.name},\n\nYour ticket "${ticket.title}" is now open.\nPriority: ${priority}\nDue Date: ${dueDate}`,
            });
        } catch (emailError) {
            console.error("Email failed to send:", emailError.message);
        }

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Security: Only allow owner or staff to view
        const isStaff = ["Admin", "Agent", "Manager", "Super Admin"].includes(req.user.role);
        if (ticket.user.toString() !== req.user._id.toString() && !isStaff) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ticket (Including Assignment)
// @route   PUT /api/tickets/:id
const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Role-based Security check
        const isStaff = ["Admin", "Agent", "Manager", "Super Admin"].includes(req.user.role);
        const canAssign = ["Admin", "Manager", "Super Admin"].includes(req.user.role);
        const isOwner = ticket.user.toString() === req.user._id.toString();

        if (!isOwner && !isStaff) {
            return res.status(401).json({ message: "Not authorized to update this ticket" });
        }

        const oldStatus = ticket.status;
        const oldAssignee = ticket.assignedTo ? ticket.assignedTo.toString() : null;

        // Prevent Mass Assignment: Filter fields based on role
        const updates = {};
        const allowedFields = ["title", "description", "status", "category", "priority"];

        // Only Admin/Manager can assign
        if (canAssign && req.body.assignedTo) {
            updates.assignedTo = req.body.assignedTo;
        }

        // Only allow specific fields to be updated
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updates, // Use filtered updates
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email'); // Populate to get agent details

        // --- TRIGGER: Notification for Status Change ---
        if (oldStatus !== updatedTicket.status) {
            await Notification.create({
                user: updatedTicket.user,
                message: `Ticket #${updatedTicket._id.toString().slice(-6)} status changed to ${updatedTicket.status}`,
                type: "info"
            });
        }

        // --- TRIGGER: Notification for New Assignment ---
        if (req.body.assignedTo && oldAssignee !== req.body.assignedTo) {
            if (updatedTicket.assignedTo) {
                await Notification.create({
                    user: updatedTicket.assignedTo._id || updatedTicket.assignedTo, // Handle populated vs unpopulated
                    message: `A new ticket has been assigned to you: #${updatedTicket._id.toString().slice(-6)}`,
                    type: "success"
                });
            }
        }

        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get Ticket Statistics for Reports
// @route   GET /api/tickets/stats
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
    getTickets,
    createTicket,
    getTicketById,
    updateTicket,
    getTicketStats
};
