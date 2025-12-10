const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Participation = require('../models/Participation');
const Contest = require('../models/Contest');
const User = require('../models/User');

router.post('/complete', auth, async (req, res) => {
  try {
    const { participationId } = req.body;
    const userId = req.user.userId;

    if (!participationId) {
      return res.status(400).json({ message: 'participationId is required' });
    }

    const participation = await Participation.findById(participationId);
    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized for this participation' });
    }

    if (participation.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    participation.paymentStatus = 'completed';
    await participation.save();

    await Contest.findByIdAndUpdate(participation.contestId, { $inc: { participantCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { participationCount: 1 } });

    res.json({ message: 'Payment completed and participation confirmed', participation });
  } catch (error) {
    console.error('Payment complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
