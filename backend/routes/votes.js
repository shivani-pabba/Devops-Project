const express = require('express');
const crypto = require('crypto');
const Vote = require('../models/Vote');
const WBBEntry = require('../models/WBBEntry');
const Election = require('../models/Election');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Utility: generate 8-digit tracker
const genTracker = () => Math.floor(10000000 + Math.random() * 90000000).toString();
const genHash = (data) => crypto.createHash('sha256').update(data + Date.now()).digest('hex');
const genProof = () => crypto.randomBytes(20).toString('hex');

// POST /api/votes/cast — voter casts a vote
router.post('/cast', protect, restrictTo('voter'), async (req, res) => {
  try {
    const { electionId, choice } = req.body;
    if (!electionId || !choice)
      return res.status(400).json({ message: 'electionId and choice required' });

    const election = await Election.findById(electionId);
    if (!election || election.status !== 'active')
      return res.status(400).json({ message: 'Election is not active' });

    if (!election.options.includes(choice))
      return res.status(400).json({ message: `Invalid choice. Options: ${election.options.join(', ')}` });

    const alreadyVoted = await Vote.findOne({ election: electionId, voter: req.user._id });
    if (alreadyVoted) return res.status(400).json({ message: 'You have already voted in this election' });

    // Generate tracker & cryptographic placeholders
    let tracker;
    let attempts = 0;
    do {
      tracker = genTracker();
      attempts++;
    } while ((await Vote.findOne({ tracker })) && attempts < 10);

    const betaCommitment = req.user.betaCommitment || genHash('beta' + req.user._id);
    const alphaValue = genHash('alpha' + tracker);
    const encryptedBallot = genHash('enc' + choice + tracker);
    const nizkpokProof = genProof();
    const quorumHash = genHash(tracker + choice + nizkpokProof);

    const vote = await Vote.create({
      election: electionId,
      voter: req.user._id,
      tracker,
      choice,
      betaCommitment,
      alphaValue,
      encryptedBallot,
      nizkpokProof,
      shuffleProofValid: true,
      quorumHash,
      publishedToWBB: true,
      wbbTimestamp: new Date(),
    });

    // Publish to WBB
    await WBBEntry.create({
      election: electionId,
      tracker,
      vote: choice,
      quorumHash,
      nizkpokProof,
    });

    // Update user hasVoted
    await User.findByIdAndUpdate(req.user._id, { hasVoted: true, alphaValue });
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

    res.status(201).json({
      message: 'Vote cast successfully',
      tracker,
      alphaValue,
      betaCommitment,
      quorumHash,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/votes/verify — voter verifies their vote
router.post('/verify', protect, async (req, res) => {
  try {
    const { tracker, expectedChoice, electionId } = req.body;
    if (!tracker || !expectedChoice)
      return res.status(400).json({ message: 'tracker and expectedChoice required' });

    // Look up on WBB
    const query = electionId ? { tracker, election: electionId } : { tracker };
    const wbbEntry = await WBBEntry.findOne(query);

    if (!wbbEntry) {
      return res.json({ result: 'not_found', tracker });
    }

    const authentic = wbbEntry.vote === expectedChoice;
    const result = authentic ? 'authentic' : 'fraud';

    // Record verification attempt
    const vote = await Vote.findOne({ tracker });
    if (vote) {
      await Vote.findByIdAndUpdate(vote._id, {
        voterVerified: true,
        verifiedAt: new Date(),
        verificationResult: result,
      });
      await Election.findByIdAndUpdate(vote.election, { $inc: { totalVerified: authentic ? 1 : 0 } });
    }

    res.json({
      result,
      tracker,
      recordedVote: wbbEntry.vote,
      expectedChoice,
      quorumHash: wbbEntry.quorumHash,
      nizkpokProof: wbbEntry.nizkpokProof,
      nodeConsensus: wbbEntry.nodeConsensus,
      totalNodes: wbbEntry.totalNodes,
      timestamp: wbbEntry.timestamp,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/votes/wbb/:electionId — public WBB entries
router.get('/wbb/:electionId', protect, async (req, res) => {
  try {
    const entries = await WBBEntry.find({ election: req.params.electionId })
      .sort('-timestamp')
      .limit(50);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/votes/wbb-search/:tracker — look up single tracker on WBB
router.get('/wbb-search/:tracker', protect, async (req, res) => {
  try {
    const entry = await WBBEntry.findOne({ tracker: req.params.tracker });
    if (!entry) return res.status(404).json({ message: 'Tracker not found on WBB' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/votes/my/:electionId — voter gets their own vote info
router.get('/my/:electionId', protect, restrictTo('voter'), async (req, res) => {
  try {
    const vote = await Vote.findOne({ election: req.params.electionId, voter: req.user._id });
    if (!vote) return res.status(404).json({ message: 'No vote found' });
    res.json({
      tracker: vote.tracker,
      alphaValue: vote.alphaValue,
      betaCommitment: vote.betaCommitment,
      publishedToWBB: vote.publishedToWBB,
      wbbTimestamp: vote.wbbTimestamp,
      voterVerified: vote.voterVerified,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/votes/admin/:electionId — admin/auditor full list
router.get('/admin/:electionId', protect, restrictTo('admin', 'auditor'), async (req, res) => {
  try {
    const votes = await Vote.find({ election: req.params.electionId })
      .populate('voter', 'name email voterCredential')
      .sort('-castAt');
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
