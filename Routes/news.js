const express = require('express');
const router = express.Router();
const newsApiService = require('../Services/newsApiService');
const CachedNews = require('../Models/cachedNews');

// Get latest news with optional filters
router.get('/latest', async (req, res) => {
  try {
    const { country, category, language, size } = req.query;
    
    // Create cache key from params
    const cacheKey = `news_${country || 'all'}_${category || 'all'}_${language || 'en'}_${size || 30}`;
    
    // Check cache first
    const cachedData = await CachedNews.findOne({ cacheKey });
    if (cachedData) {
      return res.json({
        success: true,
        cached: true,
        articles: cachedData.articles
      });
    }
    
    // Fetch fresh news
    const articles = await newsApiService.fetchLatestNews({
      country,
      category,
      language: language || 'en',
      size: parseInt(size) || 30
    });
    
    // Cache the results
    await CachedNews.findOneAndUpdate(
      { cacheKey },
      { cacheKey, articles, createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      cached: false,
      articles
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get news by specific article ID
router.get('/article/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Search in cached news
    const cachedData = await CachedNews.findOne({ 'articles.id': id });
    
    if (cachedData) {
      const article = cachedData.articles.find(a => a.id === id);
      if (article) {
        return res.json({ success: true, article });
      }
    }
    
    res.status(404).json({ success: false, error: 'Article not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get rate limit info (for debugging)
router.get('/rate-limit', (req, res) => {
  res.json({
    success: true,
    rateLimitInfo: newsApiService.getRateLimitInfo()
  });
});

module.exports = router;
