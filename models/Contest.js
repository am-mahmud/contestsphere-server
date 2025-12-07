const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  prizeMoney: {
    type: Number,
    required: true
  },
  taskInstruction: {
    type: String,
    required: true
  },
  contestType: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  participantCount: {
    type: Number,
    default: 0
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contest', contestSchema);