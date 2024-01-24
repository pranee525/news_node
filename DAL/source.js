const Source = require('../Models/source');

const sourceController = {
  saveSource: async (sourceData) => {
    try {
      const source = new Source(sourceData);
      const savedSource = await source.save();
      return savedSource;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateSource: async (id, sourceData) => {
    try {
      const updatedSource = await Source.findByIdAndUpdate(
        id,
        sourceData,
        { new: true }
      );
      return updatedSource;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteSource: async (id) => {
    try {
      const deletedSource = await Source.findByIdAndDelete(id);
      return deletedSource;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllSources: async () => {
    try {
      const sources = await Source.find();
      return sources;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSourceById: async (id) => {
    try {
      const source = await Source.findById(id);
      if (!source) {
        throw new Error('Source not found');
      }
      return source;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = sourceController;
