const Language = require('../Models/language');

const languageController = {
  saveLanguage: async (languageData) => {
    try {
      const language = new Language(languageData);
      const savedLanguage = await language.save();
      return savedLanguage;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateLanguage: async (id, languageData) => {
    try {
      const updatedLanguage = await Language.findByIdAndUpdate(
        id,
        languageData,
        { new: true }
      );
      return updatedLanguage;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteLanguage: async (id) => {
    try {
      const deletedLanguage = await Language.findByIdAndDelete(id);
      return deletedLanguage;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllLanguages: async () => {
    try {
      const languages = await Language.find();
      return languages;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getLanguageById: async (id) => {
    try {
      const language = await Language.findById(id);
      if (!language) {
        throw new Error('Language not found');
      }
      return language;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = languageController;
