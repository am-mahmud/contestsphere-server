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
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  submittedTask: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});


participationSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);