const Category = require('../Models/category');

const categoryController = {
  saveCategory: async (categoryData) => {
    try {
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      return savedCategory;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        categoryData,
        { new: true }
      );
      return updatedCategory;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteCategory: async (id) => {
    try {
      const deletedCategory = await Category.findByIdAndDelete(id);
      return deletedCategory;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllCategories: async () => {
    try {
      const categories = await Category.find();
      return categories;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCategoryById: async (id) => {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = categoryController;
