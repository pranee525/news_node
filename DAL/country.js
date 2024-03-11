const Country = require('../Models/countries');
const scrapeCountry = require('../Models/scrapeCountries')

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
  checkAndInsertCountryToScrpe: async (countryList) => {

    try {
      const result = countryList.split(',');
      for (const value of result) {
        
          const query = { country_code: value } ;
        const existingValue = await scrapeCountry.findOne(query);
        if (!existingValue) {
          const valToInsert=new scrapeCountry( {
            country_code:value
          });
          // If the value does not exist, insert it into the collection
          await valToInsert.save(valToInsert);
          console.log(`Inserted ${value} into the collection.`);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }


  }


};

module.exports = countryController;
