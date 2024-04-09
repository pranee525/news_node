// users.js

const express = require('express');
const router = express.Router();
const User = require('../Models/users');
const countryInsert=require('../DAL/country');

// Add a new user
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    newUser.email=newUser.email!=""?newUser.email:"user"+new Date().getTime()+"@headlinez.com";
    newUser.password=newUser.password!=""?newUser.password:new Date().getTime()+new Date().getMilliseconds();
    const savedUser = await newUser.save();
    console.log(newUser.selectedCountries);
    countryInsert.checkAndInsertCountryToScrpe(newUser.selectedCountries);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Select users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//find specific user
router.get('/:identifier', async (req, res) => {
    try {
      const identifier = req.params.identifier;
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
