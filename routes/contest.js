const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const creator = require('../middleware/creator');
const Contest = require('../models/Contest');

router.get('/', async (req, res) => {
    try {
        const { search, contestType, status, sort, page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { contestType: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (contestType) {
            query.contestType = contestType;
        }
        if (status) {
            query.status = status;
        } else {
            query.status = 'confirmed';
        }

        let sortOption = {};
        if (sort === 'popular') {
            sortOption = { participantCount: -1 };
        } else if (sort === 'deadline') {
            sortOption = { deadline: 1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const contests = await Contest.find(query)
            .populate('creatorId', 'name photo')
            .populate('winnerId', 'name photo')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

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

// POST create new contest (Creator/Admin only)
router.post('/', auth, creator, async (req, res) => {
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
            status: 'pending'
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

// GET creator's own contests
router.get('/creator/my-contests', auth, creator, async (req, res) => {
    try {
        const contests = await Contest.find({ creatorId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('winnerId', 'name photo');

        res.json(contests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update contest (Creator only, before approval)
router.put('/:id', auth, creator, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check ownership
        if (contest.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only edit your own contests' });
        }

        // Check if still pending
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

// DELETE contest (Creator: only pending | Admin: any)
router.delete('/:id', auth, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check authorization
        const isCreator = contest.creatorId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this contest' });
        }

        // Creators can only delete pending contests
        if (isCreator && !isAdmin && contest.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete contest after approval' });
        }

        // Admin can delete any contest
        await Contest.findByIdAndDelete(req.params.id);

        res.json({ message: 'Contest deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT approve contest (Admin only)
router.put('/:id/approve', auth, admin, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending contests can be approved' });
        }

        contest.status = 'confirmed';
        await contest.save();

        res.json({
            message: 'Contest approved successfully',
            contest
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT reject contest (Admin only)
router.put('/:id/reject', auth, admin, async (req, res) => {
    try {
        const { reason } = req.body;

        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending contests can be rejected' });
        }

        contest.status = 'rejected';
        await contest.save();

        res.json({
            message: 'Contest rejected successfully',
            contest,
            reason: reason || 'No reason provided'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;