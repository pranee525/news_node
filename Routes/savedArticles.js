const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get all saved articles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { category } = req.query;
    
    let savedArticles = user.savedArticles || [];
    
    // Filter by category if provided
    if (category && category !== 'all') {
      savedArticles = savedArticles.filter(article => 
        article.category && article.category.includes(category)
      );
    }
    
    // Sort by savedAt descending
    savedArticles.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    res.json({
      success: true,
      savedArticles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save an article
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { article } = req.body;
    
    if (!article || !article.id) {
      return res.status(400).json({ success: false, error: 'Article data is required' });
    }
    
    // Check if already saved
    const existingIndex = req.user.savedArticles.findIndex(
      a => a.articleId === article.id
    );
    
    if (existingIndex !== -1) {
      return res.status(400).json({ success: false, error: 'Article already saved' });
    }
    
    // Add to saved articles
    req.user.savedArticles.push({
      articleId: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.imageUrl,
      sourceName: article.sourceName,
      publishedAt: article.publishedAt,
      category: article.category || [],
      country: article.country || [],
      language: article.language,
      savedAt: new Date()
    });
    
    await req.user.save();
    
    res.status(201).json({
      success: true,
      message: 'Article saved successfully',
      savedArticles: req.user.savedArticles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove a saved article
router.delete('/:articleId', authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const initialLength = req.user.savedArticles.length;
    req.user.savedArticles = req.user.savedArticles.filter(
      a => a.articleId !== articleId
    );
    
    if (req.user.savedArticles.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Article not found in saved list' });
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Article removed from saved list',
      savedArticles: req.user.savedArticles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if article is saved
router.get('/check/:articleId', authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const isSaved = req.user.savedArticles.some(
      a => a.articleId === articleId
    );
    
    res.json({
      success: true,
      isSaved
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
