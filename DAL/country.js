const Country = require('../Models/countries');

const countryController = {
  saveCountry: async (countryData) => {
    try {
      const country = new Country(countryData);
      const savedCountry = await country.save();
      return savedCountry;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateCountry: async (id, countryData) => {
    try {
      const updatedCountry = await Country.findByIdAndUpdate(
        id,
        countryData,
        { new: true }
      );
      return updatedCountry;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCountry: async (id) => {
    try {
      const deletedCountry = await Country.findByIdAndDelete(id);
      return deletedCountry;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllCountries: async () => {
    try {
      const countries = await Country.find();
      return countries;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCountryById: async (id) => {
    try {
      const country = await Country.findById(id);
      if (!country) {
        throw new Error('Country not found');
      }
      return country;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = countryController;
