const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contest = require('../models/Contest');

// GET all contests (Public - with filters, search, sort)
router.get('/', async (req, res) => {
  try {
    const { search, contestType, status, sort, page = 1, limit = 10 } = req.query;

    // Build query object
    let query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by contest type
    if (contestType) {
      query.contestType = contestType;
    }

    // Filter by status (default to confirmed for public)
    if (status) {
      query.status = status;
    } else {
      query.status = 'confirmed'; // Only show approved contests
    }

    // Sorting
    let sortOption = {};
    if (sort === 'popular') {
      sortOption = { participantCount: -1 }; // Most participants first
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1 }; // Earliest deadline first
    } else {
      sortOption = { createdAt: -1 }; // Newest first (default)
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const contests = await Contest.find(query)
      .populate('creatorId', 'name photo')
      .populate('winnerId', 'name photo')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Contest.countDocuments(query);

    res.json({
      contests,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single contest by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('creatorId', 'name email photo')
      .populate('winnerId', 'name photo');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create contest (Protected - Creator/Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      image,
      description,
      price,
      prizeMoney,
      taskInstruction,
      contestType,
      deadline
    } = req.body;

    // Check if user is creator or admin
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only creators can create contests' });
    }

    // Create new contest
    const contest = new Contest({
      name,
      image,
      description,
      price,
      prizeMoney,
      taskInstruction,
      contestType,
      deadline,
      creatorId: req.user.userId,
      status: 'pending' // Needs admin approval
    });

    await contest.save();

    res.status(201).json({
      message: 'Contest created successfully. Waiting for admin approval.',
      contest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update contest (Protected - Own contest only, before approval)
router.put('/:id', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user is the creator
    if (contest.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own contests' });
    }

    // Check if contest is still pending (can't edit after approval)
    if (contest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit contest after approval/rejection' });
    }

    // Update fields
    const {
      name,
      image,
      description,
      price,
      prizeMoney,
      taskInstruction,
      contestType,
      deadline
    } = req.body;

    contest.name = name || contest.name;
    contest.image = image || contest.image;
    contest.description = description || contest.description;
    contest.price = price || contest.price;
    contest.prizeMoney = prizeMoney || contest.prizeMoney;
    contest.taskInstruction = taskInstruction || contest.taskInstruction;
    contest.contestType = contestType || contest.contestType;
    contest.deadline = deadline || contest.deadline;

    await contest.save();

    res.json({
      message: 'Contest updated successfully',
      contest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE contest (Protected - Own contest only, before approval)
router.delete('/:id', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user is the creator or admin
    if (contest.creatorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this contest' });
    }

    // Check if contest is still pending (can't delete after approval)
    if (contest.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete contest after approval' });
    }

    await Contest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contest deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update contest status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    contest.status = status;
    await contest.save();

    res.json({
      message: `Contest ${status} successfully`,
      contest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;