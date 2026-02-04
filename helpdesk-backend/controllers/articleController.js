const Article = require("../models/Article");

// @desc    Get all articles (with search & filter)
// @route   GET /api/articles?search=...&category=...
const getArticles = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      // Search in Title or Content
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const articles = await Article.find(query);
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