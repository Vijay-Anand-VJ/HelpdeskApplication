const Ticket = require("../models/Ticket");
const User = require("../models/user"); // Fixed duplicate import
const sendEmail = require("../utils/sendEmail");

// @desc    Get user tickets
// @route   GET /api/tickets
const getTickets = async (req, res) => {
  try {
    // If Admin/Agent, fetch ALL tickets. If Customer, fetch ONLY theirs.
    let tickets;
    if (req.user.role === "Customer") {
      tickets = await Ticket.find({ user: req.user.id });
    } else {
      tickets = await Ticket.find(); // Admins see everything
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
    let dueDate = new Date(); // Start with "Right Now"
    
    if (priority === "Low") {
      dueDate.setHours(dueDate.getHours() + 48); // +2 Days
    } else if (priority === "Medium") {
      dueDate.setHours(dueDate.getHours() + 24); // +1 Day
    } else if (priority === "High") {
      dueDate.setHours(dueDate.getHours() + 4);  // +4 Hours
    } else if (priority === "Critical") {
      dueDate.setHours(dueDate.getHours() + 1);  // +1 Hour
    }

    // 2. Handle File Upload (if exists)
    const attachmentPath = req.file ? req.file.path : null;

    // 3. Create Ticket
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      user: req.user.id,
      status: "Open",
      attachment: attachmentPath,
      dueDate: dueDate, // <--- Save the calculated deadline
    });

    // --- NEW: SEND EMAIL NOTIFICATION ---
    try {
      // Fetch user details to get the email address
      const user = await User.findById(req.user.id);
      
      await sendEmail({
        email: user.email,
        subject: `Ticket Created: #${ticket._id}`,
        message: `Hello ${user.name},\n\nYour ticket "${ticket.title}" has been created successfully.\n\nPriority: ${ticket.priority}\nDue Date: ${dueDate}\n\nTrack status on your dashboard.`,
      });
    } catch (emailError) {
      console.error("Email could not be sent:", emailError.message);
      // Don't crash the app if email fails, just log it
    }
    // ------------------------------------

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
    if (ticket.user.toString() !== req.user.id && req.user.role === "Customer") {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Limit who can update
    if (ticket.user.toString() !== req.user.id && req.user.role === "Customer") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the new updated version
    );

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

    // 1. Status Counts
    const statusData = {
      open: tickets.filter((t) => t.status === "Open").length,
      inProgress: tickets.filter((t) => t.status === "In Progress").length,
      closed: tickets.filter((t) => t.status === "Closed").length,
    };

    // 2. Priority Counts (For Pie Chart)
    const priorityData = {
      low: tickets.filter((t) => t.priority === "Low").length,
      medium: tickets.filter((t) => t.priority === "Medium").length,
      high: tickets.filter((t) => t.priority === "High").length,
      critical: tickets.filter((t) => t.priority === "Critical").length,
    };

    // 3. Category Counts (For Bar Chart)
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