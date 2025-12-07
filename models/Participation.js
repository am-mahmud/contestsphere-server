const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  paymentStatus: {
    type: String,
    default: 'completed'
  },
  submittedTask: {
    type: String
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Participation', participationSchema);