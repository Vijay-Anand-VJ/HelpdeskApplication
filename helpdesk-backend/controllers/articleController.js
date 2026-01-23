const Article = require("../models/Article");

// @desc    Get all articles
// @route   GET /api/articles
const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({});
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an article (Admin/Manager only)
// @route   POST /api/articles
const createArticle = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const article = await Article.create({
      title,
      content,
      category,
      author: req.user.id,
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getArticles, createArticle };