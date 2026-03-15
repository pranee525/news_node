const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get user stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      stats: {
        articlesRead: user.stats?.articlesRead || 0,
        currentStreak: user.stats?.currentStreak || 0,
        lastReadDate: user.stats?.lastReadDate,
        totalTimeSpent: user.stats?.totalTimeSpent || 0,
        savedArticlesCount: user.savedArticles?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record article read
router.post('/read', authMiddleware, async (req, res) => {
  try {
    const { articleId, timeSpent } = req.body;
    
    // Increment articles read
    if (!req.user.stats) {
      req.user.stats = {
        articlesRead: 0,
        currentStreak: 0,
        totalTimeSpent: 0
      };
    }
    
    req.user.stats.articlesRead += 1;
    
    // Update streak
    req.user.updateStreak();
    
    // Add time spent (in seconds)
    if (timeSpent && typeof timeSpent === 'number') {
      req.user.stats.totalTimeSpent += timeSpent;
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      stats: req.user.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset stats (for testing)
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    req.user.stats = {
      articlesRead: 0,
      currentStreak: 0,
      lastReadDate: null,
      totalTimeSpent: 0
    };
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Stats reset successfully',
      stats: req.user.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
