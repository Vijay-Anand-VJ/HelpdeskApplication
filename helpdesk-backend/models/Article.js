const mongoose = require("mongoose");

const articleSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // The article text
    category: { type: String, required: true }, // e.g., "General", "Technical"
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    isPublic: { type: Boolean, default: true }, // Can customers see this?
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);