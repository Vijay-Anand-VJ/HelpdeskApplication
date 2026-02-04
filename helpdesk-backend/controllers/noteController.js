const Note = require("../models/Note");
const Ticket = require("../models/Ticket");

// @desc    Get notes for a ticket
// @route   GET /api/tickets/:ticketId/notes
const getNotes = async (req, res) => {
  try {
    // 1. Ensure ticket exists (optional security check)
    const ticket = await Ticket.findById(req.params.ticketId);

    // 2. Fetch notes
    // If Customer, HIDE internal notes
    let query = { ticket: req.params.ticketId };
    if (req.user.role === "Customer") {
      query.isInternal = false;
    }

    const notes = await Note.find(query);

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create ticket note
// @route   POST /api/tickets/:ticketId/notes
const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);

    if (ticket.user.toString() !== req.user.id && req.user.role === "Customer") {
      res.status(401);
      throw new Error("User not authorized");
    }

    const attachmentPath = req.file ? req.file.path : null;

    const note = await Note.create({
      text,
      isStaff: req.user.role !== "Customer", // Mark as staff reply if not customer
      isInternal: req.body.isInternal === 'true' || req.body.isInternal === true, // Handle FormData string or JSON bool
      ticket: req.params.ticketId,
      user: req.user.id,
      attachment: attachmentPath,
    });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, addNote };