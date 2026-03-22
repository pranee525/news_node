const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
const newsRoutes = require('./Routes/news');
app.use('/api/news', newsRoutes);

const authRoutes = require('./Routes/auth');
app.use('/api/auth', authRoutes);

const preferencesRoutes = require('./Routes/userPreferences');
app.use('/api/preferences', preferencesRoutes);

const savedArticlesRoutes = require('./Routes/savedArticles');
app.use('/api/saved', savedArticlesRoutes);

const userStatsRoutes = require('./Routes/userStats');
app.use('/api/stats', userStatsRoutes);

const aiRoutes = require('./Routes/ai');
app.use('/api/ai', aiRoutes);

// Legacy routes (keeping for backward compatibility)
const countries = require('./Routes/countries');
app.use('/api/countries', countries);

const article = require('./Routes/article');
app.use('/api/article', article);

const category = require('./Routes/category');
app.use('/api/category', category);

const language = require('./Routes/language');
app.use('/api/language', language);

const source = require('./Routes/source');
app.use('/api/source', source);

const user = require('./Routes/users');
app.use('/api/user', user);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Headlinez API server running on port ${PORT}`);
});
