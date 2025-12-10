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
    default: 'completed'
  },
  submittedTask: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Participation', participationSchema);




// models/Participation.js
// const mongoose = require('mongoose');

// const participationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   contestId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Contest',
//     required: true
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'completed', 'failed'],
//     default: 'pending'
//   },
//   submittedTask: {
//     type: String,
//     default: ''
//   },
//   submittedAt: {
//     type: Date,
//     default: null
//   },
//   isWinner: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Participation', participationSchema);
