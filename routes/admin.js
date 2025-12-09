const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminController = require('../controllers/admin');

router.get('/users', auth, adminMiddleware, adminController.getAllUsers);
router.put('/users/role', auth, adminMiddleware, adminController.changeUserRole);
router.delete('/users/:userId', auth, adminMiddleware, adminController.deleteUser);

router.get('/contests', auth, adminMiddleware, adminController.getAllContests);
router.put('/contests/:contestId/approve', auth, adminMiddleware, adminController.approveContest);
router.put('/contests/:contestId/reject', auth, adminMiddleware, adminController.rejectContest);

module.exports = router;