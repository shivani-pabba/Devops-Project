const express = require('express');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// GET /api/elections — list all (authenticated)
router.get('/', protect, async (req, res) => {
  try {
    const elections = await Election.find().sort('-createdAt');
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/elections/active
router.get('/active', protect, async (req, res) => {
  try {
    const election = await Election.findOne({ status: 'active' });
    if (!election) return res.status(404).json({ message: 'No active election' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/elections/:id/stats
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const totalVotes = await Vote.countDocuments({ election: election._id });
    const totalVerified = await Vote.countDocuments({ election: election._id, voterVerified: true });
    const nizkpokValid = await Vote.countDocuments({ election: election._id, shuffleProofValid: true });
    const anomalies = await Vote.countDocuments({ election: election._id, verificationResult: 'fraud' });

    const voteCounts = await Vote.aggregate([
      { $match: { election: election._id, publishedToWBB: true } },
      { $group: { _id: '$choice', count: { $sum: 1 } } },
    ]);

    res.json({
      election,
      stats: {
        totalRegistered: election.totalRegistered,
        totalVotes,
        totalVerified,
        nizkpokValid,
        anomalies,
        turnout: election.totalRegistered > 0 ? ((totalVotes / election.totalRegistered) * 100).toFixed(1) : 0,
        verificationRate: totalVotes > 0 ? ((totalVerified / totalVotes) * 100).toFixed(1) : 0,
        voteCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/elections — admin create
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const election = await Election.create(req.body);
    res.status(201).json(election);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/elections/:id — admin update
router.patch('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(election);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
