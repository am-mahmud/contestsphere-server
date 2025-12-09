const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const creatorMiddleware = require('../middleware/creator');
const creatorController = require('../controllers/creator');

router.post('/contest', auth, creatorMiddleware, creatorController.addContest);
router.get('/contests', auth, creatorMiddleware, creatorController.getMyContests);
router.put('/contests/:contestId', auth, creatorMiddleware, creatorController.editContest);
router.delete('/contests/:contestId', auth, creatorMiddleware, creatorController.deleteContest);

router.get('/submissions', auth, creatorMiddleware, creatorController.getSubmissions);
router.post('/declare-winner', auth, creatorMiddleware, creatorController.declareWinner);

module.exports = router;