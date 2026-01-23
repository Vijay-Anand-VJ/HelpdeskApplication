const express = require("express");
const router = express.Router();
const { getArticles, createArticle } = require("../controllers/articleController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getArticles) // Anyone logged in can read
  .post(protect, createArticle); // We will restrict this to Admins in frontend for simplicity

module.exports = router;