const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  selectedCountries: [{
    type: String
  }],
  selectedTopics: [{
    type: String
  }],
  savedArticles: [{
    articleId: String,
    title: String,
    description: String,
    url: String,
    imageUrl: String,
    sourceName: String,
    publishedAt: Date,
    category: [String],
    country: [String],
    language: String,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    articlesRead: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastReadDate: Date,
    totalTimeSpent: { type: Number, default: 0 }
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.stats.lastReadDate) {
    const lastRead = new Date(this.stats.lastReadDate);
    lastRead.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastRead) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.stats.currentStreak += 1;
    } else if (diffDays > 1) {
      this.stats.currentStreak = 1;
    }
  } else {
    this.stats.currentStreak = 1;
  }
  
  this.stats.lastReadDate = new Date();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
