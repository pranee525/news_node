const mongoose = require('mongoose');

const cachedNewsSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  articles: [{
    id: String,
    title: String,
    description: String,
    url: String,
    imageUrl: String,
    sourceName: String,
    publishedAt: Date,
    category: [String],
    country: [String],
    language: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // Cache expires after 30 minutes
  }
});

const CachedNews = mongoose.model('CachedNews', cachedNewsSchema);

module.exports = CachedNews;
