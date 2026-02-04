const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Ticket",
    },
    attachment: {
      type: String, // URL/Path to file
    },
    text: {
      type: String,
      required: true,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
    staffId: {
      type: String,
    },
    isInternal: {
      type: Boolean,
      default: false, // true = Hidden from Customer
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);