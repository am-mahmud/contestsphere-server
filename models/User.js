const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
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
  },
  bio: {
    type: String,
    default: ''
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);