const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
 news_id: {
    type: String,
    maxlength: 255,
  },
  title: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
    required: true,
    maxlength: 255,
  },
  author: {
    type: String,
    maxlength: 100,
  },
  image: {
    type: String,
  },
  language_id: {
    type: String,
    maxlength: 3,
  },
  category_id: {
    type: String,
    maxlength: 50,
  },
  source_id: {
    type: Number,
  },
  country_id: {
    type: Number,
  },
  published_at: {
    type: Date,
    required: true,
  },
});

const article = mongoose.model('article', articleSchema);

module.exports = article;