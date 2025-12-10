const User = require('../models/User');
const Contest = require('../models/Contest');
const Participation = require('../models/Participation');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, photo } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, photo },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const joinContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only join confirmed contests' });
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

    await Contest.findByIdAndUpdate(
      contestId,
      { $inc: { participantCount: 1 } }
    );


    await User.findByIdAndUpdate(
      userId,
      { $inc: { participationCount: 1 } }
    );

    res.status(201).json({ message: 'Successfully joined contest', participation });
  } catch (err) {
    res.status(500).json({ message: 'Error joining contest' });
  }
};

const getParticipatedContests = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await Participation.find({ userId })
      .populate('contestId')
      .sort({ createdAt: -1 });

    const contests = participations.map(p => p.contestId);

    res.status(200).json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching participated contests' });
  }
};

const getWonContests = async (req, res) => {
  try {
    const userId = req.user.id;

    const contests = await Contest.find({ winnerId: userId })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching won contests' });
  }
};

const submitTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contestId, submittedTask } = req.body;

    const participation = await Participation.findOne({ userId, contestId });

    if (!participation) {
      return res.status(404).json({ message: 'Not participated in this contest' });
    }

    const contest = await Contest.findById(contestId);

    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Deadline has passed' });
    }

    const updated = await Participation.findByIdAndUpdate(
      participation._id,
      { submittedTask, submittedAt: new Date() },
      { new: true }
    );

    res.status(200).json({ message: 'Task submitted successfully', participation: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting task' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  joinContest,
  getParticipatedContests,
  getWonContests,
  submitTask
};