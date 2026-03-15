const express = require('express');
const router = express.Router();
const aiService = require('../Services/aiService');

// Generate trending hashtags
router.post('/hashtags', async (req, res) => {
  try {
    const { titles } = req.body;
    
    if (!titles || !Array.isArray(titles)) {
      return res.status(400).json({ 
        success: false, 
        error: 'titles array is required' 
      });
    }
    
    const hashtags = await aiService.generateTrendingHashtags(titles);
    
    res.json({
      success: true,
      hashtags
    });
  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
