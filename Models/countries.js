const mongoose = require('mongoose');

const countriesSchema = new mongoose.Schema({
    
      country_code: {
        type: String,
        required: true,
        maxlength: 2,
        unique: true,
      },
      country_name: {
        type: String,
        required: true,
        maxlength: 100,
        unique: true,
      }  // Define your schema fields
});

const countries = mongoose.model('countries', countriesSchema);

module.exports = countries;