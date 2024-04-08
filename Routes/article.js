const express = require('express');
const router = express.Router();
const articleController = require('../DAL/article');

// Save a new article
router.post('/', async (req, res) => {
  try {
    const savedArticle = await articleController.saveArticle(req.body);
    res.json(savedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing article
router.put('/:id', async (req, res) => {
  try {
    const updatedArticle = await articleController.updateArticle(
      req.params.id,
      req.body
    );
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an article
router.delete('/:id', async (req, res) => {
  try {
    const deletedArticle = await articleController.deleteArticle(req.params.id);
    res.json(deletedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await articleController.getAllArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/after/:id', async (req, res) => {
  try {
    const articles = await articleController.getArticlesAfterId(req.params.id);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get a specific article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await articleController.getArticleById(req.params.id);
    res.json(article);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


//get articles by userid
router.get('/articleForUser/:id', async (req, res) => {
  try {
    const articles = await articleController.getArticlesByUserId(req.params.id);
    res.json(articles);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

//get remaining articles for user by userid and last read articleid
router.get('/getNextArticles/:id/:articleId', async (req, res) => {
  try {
    const articles = await articleController.getRemainingArticlesByUserId(req.params.id,req.params.articleId);
    res.json(articles);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
