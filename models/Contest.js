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
    required: true,
     min: 0
  },
  prizeMoney: {
    type: Number,
    required: true,
     min: 0
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
    enum: ['pending', 'confirmed', 'rejected','completed'],
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





// models/Contest.js
// const mongoose = require('mongoose');

// const contestSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   prizeMoney: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   taskInstruction: {
//     type: String,
//     required: true
//   },
//   contestType: {
//     type: String,
//     required: true
//     // you can convert to enum later if you want a fixed list
//   },
//   deadline: {
//     type: Date,
//     required: true
//   },
//   creatorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'rejected', 'completed'],
//     default: 'pending'
//   },
//   participantCount: {
//     type: Number,
//     default: 0
//   },
//   winnerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   rejectionReason: {
//     type: String,
//     default: ''
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Contest', contestSchema);
