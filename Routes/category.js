const express = require('express');
const router = express.Router();
const categoryController = require('../DAL/category');

// Save a new category
router.post('/', async (req, res) => {
  try {
    const savedCategory = await categoryController.saveCategory(req.body);
    res.json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing category
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await categoryController.updateCategory(
      req.params.id,
      req.body
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await categoryController.deleteCategory(req.params.id);
    res.json(deletedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await categoryController.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryController.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
