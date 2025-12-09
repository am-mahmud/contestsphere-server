const creator = (req, res, next) => {
  try {
    // Check if user role is creator or admin
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Creator only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = creator;