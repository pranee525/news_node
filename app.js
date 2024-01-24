const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Use body parser middleware
app.use(bodyParser.json());

//Include your Services
const newsFetchService = require('./Services/newsFetchService');
newsFetchService.start();


// Include your routes
const countries = require('./Routes/countries');
app.use('/api/countries', countries);

const apiRequestManager = require('./Routes/apiRequestManager');
app.use('/api/requestManager', apiRequestManager);


const article = require('./Routes/article');
app.use('/api/article', article);

const category = require('./Routes/category');
app.use('/api/category', category);

const language = require('./Routes/language');
app.use('/api/language', language);

const source = require('./Routes/source');
app.use('/api/source', source);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



