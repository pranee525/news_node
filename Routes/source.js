const express = require('express');
const router = express.Router();
const sourceController = require('../DAL/source');

// Save a new source
router.post('/', async (req, res) => {
  try {
    const savedSource = await sourceController.saveSource(req.body);
    res.json(savedSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing source
router.put('/:id', async (req, res) => {
  try {
    const updatedSource = await sourceController.updateSource(
      req.params.id,
      req.body
    );
    res.json(updatedSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a source
router.delete('/:id', async (req, res) => {
  try {
    const deletedSource = await sourceController.deleteSource(req.params.id);
    res.json(deletedSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sources
router.get('/', async (req, res) => {
  try {
    const sources = await sourceController.getAllSources();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific source by ID
router.get('/:id', async (req, res) => {
  try {
    const source = await sourceController.getSourceById(req.params.id);
    res.json(source);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
