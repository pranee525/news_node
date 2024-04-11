const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  phone:{ String,},
  password: {
    type: String,
  },
  selectedCountries:{
    type:String
  },
  deviceId:{
    type:String
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;