const express = require('express');
const router = express.Router();
const apiRequestManagerController = require('../DAL/apiRequestManager');

// Save a new ApiRequestManager
router.post('/', async (req, res) => {
  try {
    const savedApiRequestManager = await apiRequestManagerController.saveApiRequestManager(req.body);
    res.json(savedApiRequestManager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing ApiRequestManager
router.put('/:id', async (req, res) => {
  try {
    const updatedApiRequestManager = await apiRequestManagerController.updateApiRequestManager(
      req.params.id,
      req.body
    );
    res.json(updatedApiRequestManager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an ApiRequestManager
router.delete('/:id', async (req, res) => {
  try {
    const deletedApiRequestManager = await apiRequestManagerController.deleteApiRequestManager(req.params.id);
    res.json(deletedApiRequestManager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ApiRequestManagers
router.get('/', async (req, res) => {
  try {
    const apiRequestManagers = await apiRequestManagerController.getAllApiRequestManagers();
    res.json(apiRequestManagers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific ApiRequestManager by ID
router.get('/:id', async (req, res) => {
  try {
    const apiRequestManager = await apiRequestManagerController.getApiRequestManagerById(req.params.id);
    res.json(apiRequestManager);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
