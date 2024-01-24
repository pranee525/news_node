const express = require('express');
const router = express.Router();
const languageController = require('../DAL/language');

// Save a new language
router.post('/', async (req, res) => {
  try {
    const savedLanguage = await languageController.saveLanguage(req.body);
    res.json(savedLanguage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing language
router.put('/:id', async (req, res) => {
  try {
    const updatedLanguage = await languageController.updateLanguage(
      req.params.id,
      req.body
    );
    res.json(updatedLanguage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a language
router.delete('/:id', async (req, res) => {
  try {
    const deletedLanguage = await languageController.deleteLanguage(req.params.id);
    res.json(deletedLanguage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all languages
router.get('/', async (req, res) => {
  try {
    const languages = await languageController.getAllLanguages();
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific language by ID
router.get('/:id', async (req, res) => {
  try {
    const language = await languageController.getLanguageById(req.params.id);
    res.json(language);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
