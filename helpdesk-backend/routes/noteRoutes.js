const express = require("express");
// mergeParams: true allows us to access :ticketId from the parent router
const router = express.Router({ mergeParams: true });
const { getNotes, addNote } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.route("/")
  .get(protect, getNotes)
  .post(protect, upload.single("attachment"), addNote);

module.exports = router;