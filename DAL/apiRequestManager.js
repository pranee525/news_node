const ApiRequestManager = require('../Models/apiRequestManager');

const apiRequestManagerController = {
  saveApiRequestManager: async (apiRequestManagerData) => {
    try {
      const apiRequestManager = new ApiRequestManager(apiRequestManagerData);
      const savedApiRequestManager = await apiRequestManager.save();
      return savedApiRequestManager;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateApiRequestManager: async (id, apiRequestManagerData) => {
    try {
      const updatedApiRequestManager = await ApiRequestManager.findByIdAndUpdate(
        id,
        apiRequestManagerData,
        { new: true }
      );
      return updatedApiRequestManager;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteApiRequestManager: async (id) => {
    try {
      const deletedApiRequestManager = await ApiRequestManager.findByIdAndDelete(id);
      return deletedApiRequestManager;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllApiRequestManagers: async () => {
    try {
      const apiRequestManagers = await ApiRequestManager.find();
      return apiRequestManagers;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getApiRequestManagerById: async (id) => {
    try {
      const apiRequestManager = await ApiRequestManager.findById(id);
      if (!apiRequestManager) {
        throw new Error('ApiRequestManager not found');
      }
      return apiRequestManager;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = apiRequestManagerController;
