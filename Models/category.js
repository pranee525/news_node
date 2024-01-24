const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
 
  category_name: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true,
  },
});

const category = mongoose.model('category', categorySchema);

module.exports = category;