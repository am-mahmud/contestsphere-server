const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Participation = require('../models/Participation');
const Contest = require('../models/Contest');
const User = require('../models/User');

router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { contestId } = req.body;
    const userId = req.user.userId;

    if (!contestId) {
      return res.status(400).json({ message: 'Contest ID is required' });
    }

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if contest is confirmed
    if (contest.status !== 'confirmed') {
      return res.status(400).json({ message: 'Contest is not available for registration' });
    }

    // Check if deadline has passed
    if (new Date() > new Date(contest.deadline)) {
      return res.status(400).json({ message: 'Contest registration has ended' });
    }

    // Check if already joined
    const existing = await Participation.findOne({ userId, contestId });
    if (existing) {
      return res.status(400).json({ message: 'You have already joined this contest' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(contest.price * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        contestId: contestId,
        userId: userId,
        contestName: contest.name
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: contest.price,
      contestName: contest.name
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// Confirm payment and create participation
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, contestId } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!paymentIntentId || !contestId) {
      return res.status(400).json({ message: 'Payment intent ID and contest ID are required' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Verify metadata matches
    if (paymentIntent.metadata.contestId !== contestId || 
        paymentIntent.metadata.userId !== userId) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Check if already participated (prevent double entry)
    const existing = await Participation.findOne({ userId, contestId });
    if (existing) {
      return res.status(400).json({ message: 'Already participated in this contest' });
    }

    // Create participation record
    const participation = new Participation({
      userId,
      contestId,
      paymentStatus: 'completed',
      paymentIntentId: paymentIntentId
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

    const populatedParticipation = await Participation.findById(participation._id)
      .populate('contestId');

    res.json({
      message: 'Payment successful! You have joined the contest.',
      participation: populatedParticipation
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

// Get Stripe publishable key
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

module.exports = router;