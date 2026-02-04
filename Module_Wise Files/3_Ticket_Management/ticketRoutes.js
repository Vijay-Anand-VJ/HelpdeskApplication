const express = require("express");
const router = express.Router();
const {
    getTickets,
    createTicket,
    getTicketById,
    updateTicket,
    getTicketStats // <--- Import
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const noteRouter = require("./noteRoutes");

router.use("/:ticketId/notes", noteRouter);

// 1. Stats Route (MUST be before /:id)
router.get("/stats", protect, getTicketStats);

router.route("/")
    .get(protect, getTickets)
    .post(protect, upload.single("attachment"), createTicket);

router.route("/:id")
    .get(protect, getTicketById)
    .put(protect, updateTicket);

module.exports = router;
