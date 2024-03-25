const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
  },
  phone: String,
  password: {
    type: String,
  },
  selectedCountries:{
    type:String
  },
  deviceId:{
    type:string
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;