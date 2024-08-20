const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: {type:String},
  avatar: {type:String},
  role:{type:String, default:'USER_ROLE'},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
