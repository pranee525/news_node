const mongoose = require('mongoose');

const apiRequestManagerSchema = new mongoose.Schema({
  apiName: {
    type: String,
    required: true,
    unique: true,
  },
  apiUrl: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  requestsPerDay: {
    type: Number,
    required: true,
  },
  currentRequestCount: {
    type: Number,
    default: 0,
  },
  lastRequestedOn: {
    type: Date,
    default: null,
  },
  requestIntervalInMins: {
    type: Number,
    required: true,
  },

});

const ApiRequestManager = mongoose.model('apiRequestManager', apiRequestManagerSchema);

module.exports = ApiRequestManager;
