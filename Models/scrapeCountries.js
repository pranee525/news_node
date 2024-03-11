const mongoose = require('mongoose');

const scrapeCountries = new mongoose.Schema({
    country_code: {
        type: String,
        required: true,
        maxlength: 2,
        unique: true,
      }
});

const ScrapeCountries = mongoose.model('scrapecountries', scrapeCountries);

module.exports = ScrapeCountries;