// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const Participation = require('../models/Participation');
// const Contest = require('../models/Contest');
// const User = require('../models/User');


// router.post('/join', auth, async (req, res) => {
//   try {
//     const { contestId } = req.body;
//     const userId = req.user.userId;

//     const contest = await Contest.findById(contestId);
//     if (!contest) {
//       return res.status(404).json({ message: 'Contest not found' });
//     }

//     if (contest.status !== 'confirmed') {
//       return res.status(400).json({ message: 'Can only join confirmed contests' });
//     }

//     const existing = await Participation.findOne({ userId, contestId });
//     if (existing) {
//       return res.status(400).json({ message: 'Already joined this contest' });
//     }

//     const participation = new Participation({
//       userId,
//       contestId,
//       paymentStatus: 'completed'
//     });

//     await participation.save();

//     await Contest.findByIdAndUpdate(contestId, {
//       $inc: { participantCount: 1 }
//     });

//     await User.findByIdAndUpdate(userId, {
//       $inc: { participationCount: 1 }
//     });

//     res.status(201).json({
//       message: 'Successfully joined contest',
//       participation
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.post('/submit', auth, async (req, res) => {
//   try {
//     const { contestId, submittedTask } = req.body;
//     const userId = req.user.userId;

//     const contest = await Contest.findById(contestId);
//     if (!contest) {
//       return res.status(404).json({ message: 'Contest not found' });
//     }

//     const participation = await Participation.findOne({ userId, contestId });
//     if (!participation) {
//       return res.status(404).json({ message: 'Not participated in this contest' });
//     }

//     if (new Date() > new Date(contest.deadline)) {
//       return res.status(400).json({ message: 'Deadline has passed' });
//     }

//     participation.submittedTask = submittedTask;
//     participation.submittedAt = new Date();
//     await participation.save();

//     res.json({
//       message: 'Task submitted successfully',
//       participation
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// router.get('/my', auth, async (req, res) => {
//   try {
//     const participations = await Participation.find({ userId: req.user.userId })
//       .populate('contestId')
//       .sort({ createdAt: -1 });

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


// router.get('/contest/:contestId', auth, async (req, res) => {
//   try {
//     const { contestId } = req.params;

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
const creator = require('../middleware/creator');
const Participation = require('../models/Participation');
const Contest = require('../models/Contest');
const User = require('../models/User');


router.post('/join', auth, async (req, res) => {
  try {
    const { contestId } = req.body;
    const userId = req.user.userId;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only join confirmed contests' });
    }

    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Contest deadline has passed' });
    }

    const existing = await Participation.findOne({ userId, contestId });
    if (existing) {
      return res.status(400).json({ message: 'Already joined this contest' });
    }

    const participation = new Participation({
      userId,
      contestId,
      paymentStatus: 'completed'
    });

    await participation.save();


    await Contest.findByIdAndUpdate(contestId, { $inc: { participantCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { participationCount: 1 } });

    res.status(201).json({
      message: 'Successfully joined contest',
      participation
    });
  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/submit', auth, async (req, res) => {
  try {
    const { contestId, submittedTask } = req.body;
    const userId = req.user.userId;

    if (!submittedTask || submittedTask.trim() === '') {
      return res.status(400).json({ message: 'Task submission cannot be empty' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const participation = await Participation.findOne({ userId, contestId });
    if (!participation) {
      return res.status(404).json({ message: 'You have not joined this contest' });
    }

    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Contest deadline has passed' });
    }

    participation.submittedTask = submittedTask;
    participation.submittedAt = new Date();
    await participation.save();

    res.json({
      message: 'Task submitted successfully',
      participation
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/my', auth, async (req, res) => {
  try {
    const participations = await Participation.find({ userId: req.user.userId })
      .populate('contestId')
      .sort({ createdAt: -1 });

    res.json(participations);
  } catch (error) {
    console.error('Get participations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/wins', auth, async (req, res) => {
  try {
    const contests = await Contest.find({ winnerId: req.user.userId })
      .populate('creatorId', 'name photo')
      .sort({ createdAt: -1 });

    res.json(contests);
  } catch (error) {
    console.error('Get wins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/contest/:contestId/submissions', auth, creator, async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Participation.find({ contestId })
      .populate('userId', 'name email photo')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST declare winner (Protected - Creator)
router.post('/declare-winner', auth, creator, async (req, res) => {
  try {
    const { contestId, participationId } = req.body;

    if (!contestId || !participationId) {
      return res.status(400).json({ message: 'Contest ID and Participation ID required' });
    }

    // Check contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check authorization
    if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check deadline
    if (new Date() < new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Cannot declare winner before deadline' });
    }

    // Check if winner already declared
    if (contest.winnerId) {
      return res.status(400).json({ message: 'Winner already declared' });
    }

    // Get participation
    const participation = await Participation.findById(participationId);
    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.contestId.toString() !== contestId) {
      return res.status(400).json({ message: 'Invalid participation for this contest' });
    }

    // Update contest
    contest.winnerId = participation.userId;
    contest.status = 'completed';
    await contest.save();

    // Update user win count
    await User.findByIdAndUpdate(participation.userId, { $inc: { winCount: 1 } });

    const updatedContest = await Contest.findById(contestId)
      .populate('winnerId', 'name photo')
      .populate('creatorId', 'name photo');

    res.json({
      message: 'Winner declared successfully',
      contest: updatedContest
    });
  } catch (error) {
    console.error('Declare winner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;