const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../Models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'headlinez_jwt_secret';

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// Register/Login with device ID (anonymous user)
router.post('/device', async (req, res) => {
  try {
    let { deviceId } = req.body;
    
    if (!deviceId) {
      deviceId = uuidv4();
    }
    
    let user = await User.findOne({ deviceId });
    
    if (!user) {
      user = new User({
        deviceId,
        selectedCountries: [],
        selectedTopics: [],
        savedArticles: [],
        stats: {
          articlesRead: 0,
          currentStreak: 0
        }
      });
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        deviceId: user.deviceId,
        selectedCountries: user.selectedCountries,
        selectedTopics: user.selectedTopics,
        stats: user.stats,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Device auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register with email
router.post('/register', async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    // If deviceId provided, try to upgrade existing device user
    let user;
    if (deviceId) {
      user = await User.findOne({ deviceId });
      if (user) {
        user.email = email;
        user.password = password;
        await user.save();
      }
    }
    
    if (!user) {
      user = new User({
        email,
        password,
        deviceId: deviceId || uuidv4(),
        selectedCountries: [],
        selectedTopics: [],
        savedArticles: []
      });
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        deviceId: user.deviceId,
        selectedCountries: user.selectedCountries,
        selectedTopics: user.selectedTopics,
        stats: user.stats,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login with email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        deviceId: user.deviceId,
        selectedCountries: user.selectedCountries,
        selectedTopics: user.selectedTopics,
        stats: user.stats,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
