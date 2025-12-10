const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    // default: 'https://i.ibb.co.com/nsD8dcGf/user.png'
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  winCount: {
    type: Number,
    default: 0
  },
  participationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);