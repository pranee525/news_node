const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get user preferences
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      preferences: {
        selectedCountries: user.selectedCountries || [],
        selectedTopics: user.selectedTopics || [],
        theme: user.theme || 'system'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update selected countries
router.put('/countries', authMiddleware, async (req, res) => {
  try {
    const { countries } = req.body;
    
    if (!Array.isArray(countries)) {
      return res.status(400).json({ success: false, error: 'Countries must be an array' });
    }
    
    req.user.selectedCountries = countries;
    await req.user.save();
    
    res.json({
      success: true,
      selectedCountries: req.user.selectedCountries
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update selected topics
router.put('/topics', authMiddleware, async (req, res) => {
  try {
    const { topics } = req.body;
    
    if (!Array.isArray(topics)) {
      return res.status(400).json({ success: false, error: 'Topics must be an array' });
    }
    
    req.user.selectedTopics = topics;
    await req.user.save();
    
    res.json({
      success: true,
      selectedTopics: req.user.selectedTopics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update theme
router.put('/theme', authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ success: false, error: 'Invalid theme value' });
    }
    
    req.user.theme = theme;
    await req.user.save();
    
    res.json({
      success: true,
      theme: req.user.theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update preferences
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { selectedCountries, selectedTopics, theme } = req.body;
    
    if (selectedCountries !== undefined) {
      if (!Array.isArray(selectedCountries)) {
        return res.status(400).json({ success: false, error: 'Countries must be an array' });
      }
      req.user.selectedCountries = selectedCountries;
    }
    
    if (selectedTopics !== undefined) {
      if (!Array.isArray(selectedTopics)) {
        return res.status(400).json({ success: false, error: 'Topics must be an array' });
      }
      req.user.selectedTopics = selectedTopics;
    }
    
    if (theme !== undefined) {
      if (!['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ success: false, error: 'Invalid theme value' });
      }
      req.user.theme = theme;
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      preferences: {
        selectedCountries: req.user.selectedCountries,
        selectedTopics: req.user.selectedTopics,
        theme: req.user.theme
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
