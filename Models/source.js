const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  source_name: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true,
  },
});

const source = mongoose.model('sources', sourceSchema);

module.exports = source;