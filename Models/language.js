const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    language_code: {
        type: String,
        required: true,
        maxlength: 2,
        unique: true,
    },
  language_name: {
    type: String,
    maxlength: 100,
  },
});

const language = mongoose.model('language', languageSchema);

module.exports = language;