const User = require('../models/User');
const Contest = require('../models/Contest');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!['user', 'creator', 'admin'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role' });
  }
};

// Get all contests (for approval)
const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('creatorId', 'name email')
      .populate('winnerId', 'name email');
    res.status(200).json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contests' });
  }
};

// Approve contest
const approveContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findByIdAndUpdate(
      contestId,
      { status: 'confirmed' },
      { new: true }
    ).populate('creatorId', 'name email');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({ message: 'Contest approved successfully', contest });
  } catch (err) {
    res.status(500).json({ message: 'Error approving contest' });
  }
};

// Reject contest
const rejectContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { reason } = req.body;

    const contest = await Contest.findByIdAndUpdate(
      contestId,
      { status: 'rejected' },
      { new: true }
    ).populate('creatorId', 'name email');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({ 
      message: 'Contest rejected successfully', 
      contest,
      reason 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting contest' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  changeUserRole,
  getAllContests,
  approveContest,
  rejectContest,
  deleteUser
};