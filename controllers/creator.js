const Contest = require('../models/Contest');
const Participation = require('../models/Participation');
const User = require('../models/User');

// Add new contest
const addContest = async (req, res) => {
  try {
    const { name, image, description, price, prizeMoney, taskInstruction, contestType, deadline } = req.body;
    const creatorId = req.user.id;

    if (!name || !image || !description || !price || !prizeMoney || !taskInstruction || !contestType || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newContest = new Contest({
      name,
      image,
      description,
      price,
      prizeMoney,
      taskInstruction,
      contestType,
      deadline,
      creatorId,
      status: 'pending'
    });

    await newContest.save();
    res.status(201).json({ message: 'Contest created successfully', contest: newContest });
  } catch (err) {
    res.status(500).json({ message: 'Error creating contest' });
  }
};

// Get creator's contests
const getMyContests = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const contests = await Contest.find({ creatorId })
      .populate('winnerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contests' });
  }
};

// Edit contest (only if pending)
const editContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const creatorId = req.user.id;
    const { name, image, description, price, prizeMoney, taskInstruction, contestType, deadline } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if creator owns this contest
    if (contest.creatorId.toString() !== creatorId) {
      return res.status(403).json({ message: 'Not authorized to edit this contest' });
    }

    // Only allow editing if status is pending
    if (contest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only edit pending contests' });
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      { name, image, description, price, prizeMoney, taskInstruction, contestType, deadline },
      { new: true }
    );

    res.status(200).json({ message: 'Contest updated successfully', contest: updatedContest });
  } catch (err) {
    res.status(500).json({ message: 'Error updating contest' });
  }
};

// Delete contest (only if pending)
const deleteContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const creatorId = req.user.id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if creator owns this contest
    if (contest.creatorId.toString() !== creatorId) {
      return res.status(403).json({ message: 'Not authorized to delete this contest' });
    }

    // Only allow deletion if status is pending
    if (contest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending contests' });
    }

    await Contest.findByIdAndDelete(contestId);

    res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting contest' });
  }
};

// Get submissions for a contest
const getSubmissions = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const submissions = await Participation.find()
      .populate({
        path: 'contestId',
        match: { creatorId }
      })
      .populate('userId', 'name email photo')
      .populate('contestId', 'name');

    // Filter out null contestId (contests not created by this user)
    const filtered = submissions.filter(s => s.contestId !== null);

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Declare winner
const declareWinner = async (req, res) => {
  try {
    const { contestId, winnerId } = req.body;
    const creatorId = req.user.id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if creator owns this contest
    if (contest.creatorId.toString() !== creatorId) {
      return res.status(403).json({ message: 'Not authorized to declare winner' });
    }

    // Check if deadline has passed
    if (new Date() < new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Cannot declare winner before deadline' });
    }

    // Update contest with winner
    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      { winnerId, status: 'completed' },
      { new: true }
    ).populate('winnerId', 'name email');

    // Update winner's winCount
    await User.findByIdAndUpdate(
      winnerId,
      { $inc: { winCount: 1 } }
    );

    res.status(200).json({ message: 'Winner declared successfully', contest: updatedContest });
  } catch (err) {
    res.status(500).json({ message: 'Error declaring winner' });
  }
};

module.exports = {
  addContest,
  getMyContests,
  editContest,
  deleteContest,
  getSubmissions,
  declareWinner
};