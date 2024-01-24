const express = require('express');
const router = express.Router();
const countryController = require('../DAL/country');

// Save a new country
router.post('/', async (req, res) => {
  try {
    const savedCountry = await countryController.saveCountry(req.body);
    res.json(savedCountry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing country
router.put('/:id', async (req, res) => {
  try {
    const updatedCountry = await countryController.updateCountry(
      req.params.id,
      req.body
    );
    res.json(updatedCountry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a country
router.delete('/:id', async (req, res) => {
  try {
    const deletedCountry = await countryController.deleteCountry(req.params.id);
    res.json(deletedCountry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all countries
router.get('/', async (req, res) => {
  try {
    const countries = await countryController.getAllCountries();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific country by ID
router.get('/:id', async (req, res) => {
  try {
    const country = await countryController.getCountryById(req.params.id);
    res.json(country);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
