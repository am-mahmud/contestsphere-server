// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const Participation = require('../models/Participation');
// const Contest = require('../models/Contest');
// const User = require('../models/User');

// // GET user's participated contests
// router.get('/my', auth, async (req, res) => {
//   try {
//     const participations = await Participation.find({ userId: req.user.userId })
//       .populate('contestId')
//       .sort({ createdAt: -1 });

//     // Format response
//     const formatted = participations.map(p => ({
//       _id: p._id,
//       contest: p.contestId,
//       submittedTask: p.submittedTask,
//       submittedAt: p.submittedAt,
//       paymentStatus: p.paymentStatus,
//       createdAt: p.createdAt,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET user's winning contests
// router.get('/my/wins', auth, async (req, res) => {
//   try {
//     const contests = await Contest.find({ winnerId: req.user.userId })
//       .populate('creatorId', 'name photo')
//       .sort({ createdAt: -1 });

//     const formatted = contests.map(contest => ({
//       _id: contest._id,
//       contest: contest,
//       createdAt: contest.createdAt,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET submissions for a specific contest (Creator only)
// router.get('/contest/:contestId', auth, async (req, res) => {
//   try {
//     const { contestId } = req.params;

//     // Check if contest exists and user is the creator
//     const contest = await Contest.findById(contestId);
//     if (!contest) {
//       return res.status(404).json({ message: 'Contest not found' });
//     }

//     if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     // Get all participations for this contest
//     const submissions = await Participation.find({ contestId })
//       .populate('userId', 'name email photo')
//       .sort({ submittedAt: -1 });

//     res.json(submissions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST declare winner
// router.post('/declare-winner/:contestId/:participationId', auth, async (req, res) => {
//   try {
//     const { contestId, participationId } = req.params;

//     // Check if contest exists and user is the creator
//     const contest = await Contest.findById(contestId);
//     if (!contest) {
//       return res.status(404).json({ message: 'Contest not found' });
//     }

//     if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     // Check if deadline has passed
//     if (new Date(contest.deadline) > new Date()) {
//       return res.status(400).json({ message: 'Cannot declare winner before deadline' });
//     }

//     // Check if winner already declared
//     if (contest.winnerId) {
//       return res.status(400).json({ message: 'Winner already declared for this contest' });
//     }

//     // Get participation details
//     const participation = await Participation.findById(participationId);
//     if (!participation) {
//       return res.status(404).json({ message: 'Participation not found' });
//     }

//     // Update contest with winner
//     contest.winnerId = participation.userId;
//     await contest.save();

//     // Update user's win count
//     await User.findByIdAndUpdate(participation.userId, {
//       $inc: { winCount: 1 }
//     });

//     res.json({
//       message: 'Winner declared successfully',
//       contest,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Participation = require('../models/Participation');
const Contest = require('../models/Contest');
const User = require('../models/User');

// POST join contest
router.post('/join', auth, async (req, res) => {
  try {
    const { contestId } = req.body;
    const userId = req.user.userId;

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if contest is confirmed
    if (contest.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only join confirmed contests' });
    }

    // Check if already joined
    const existing = await Participation.findOne({ userId, contestId });
    if (existing) {
      return res.status(400).json({ message: 'Already joined this contest' });
    }

    // Create participation record
    const participation = new Participation({
      userId,
      contestId,
      paymentStatus: 'completed'
    });

    await participation.save();

    // Update contest participant count
    await Contest.findByIdAndUpdate(contestId, {
      $inc: { participantCount: 1 }
    });

    // Update user participation count
    await User.findByIdAndUpdate(userId, {
      $inc: { participationCount: 1 }
    });

    res.status(201).json({
      message: 'Successfully joined contest',
      participation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST submit task
router.post('/submit', auth, async (req, res) => {
  try {
    const { contestId, submittedTask } = req.body;
    const userId = req.user.userId;

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user has participated
    const participation = await Participation.findOne({ userId, contestId });
    if (!participation) {
      return res.status(404).json({ message: 'Not participated in this contest' });
    }

    // Check deadline
    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Deadline has passed' });
    }

    // Update participation with submission
    participation.submittedTask = submittedTask;
    participation.submittedAt = new Date();
    await participation.save();

    res.json({
      message: 'Task submitted successfully',
      participation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user's participated contests
router.get('/my', auth, async (req, res) => {
  try {
    const participations = await Participation.find({ userId: req.user.userId })
      .populate('contestId')
      .sort({ createdAt: -1 });

    // Format response
    const formatted = participations.map(p => ({
      _id: p._id,
      contest: p.contestId,
      submittedTask: p.submittedTask,
      submittedAt: p.submittedAt,
      paymentStatus: p.paymentStatus,
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user's winning contests
router.get('/my/wins', auth, async (req, res) => {
  try {
    const contests = await Contest.find({ winnerId: req.user.userId })
      .populate('creatorId', 'name photo')
      .sort({ createdAt: -1 });

    const formatted = contests.map(contest => ({
      _id: contest._id,
      contest: contest,
      createdAt: contest.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET submissions for a specific contest (Creator only)
router.get('/contest/:contestId', auth, async (req, res) => {
  try {
    const { contestId } = req.params;

    // Check if contest exists and user is the creator
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all participations for this contest
    const submissions = await Participation.find({ contestId })
      .populate('userId', 'name email photo')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST declare winner
router.post('/declare-winner/:contestId/:participationId', auth, async (req, res) => {
  try {
    const { contestId, participationId } = req.params;

    // Check if contest exists and user is the creator
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if deadline has passed
    if (new Date(contest.deadline) > new Date()) {
      return res.status(400).json({ message: 'Cannot declare winner before deadline' });
    }

    // Check if winner already declared
    if (contest.winnerId) {
      return res.status(400).json({ message: 'Winner already declared for this contest' });
    }

    // Get participation details
    const participation = await Participation.findById(participationId);
    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    // Update contest with winner
    contest.winnerId = participation.userId;
    await contest.save();

    // Update user's win count
    await User.findByIdAndUpdate(participation.userId, {
      $inc: { winCount: 1 }
    });

    res.json({
      message: 'Winner declared successfully',
      contest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;