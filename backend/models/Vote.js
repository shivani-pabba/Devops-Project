const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Tracker assigned at setup (8-digit)
  tracker: { type: String, required: true, unique: true },
  // The actual vote choice
  choice: { type: String, required: true },
  // Cryptographic fields (simulated / placeholder for real impl)
  betaCommitment: { type: String },
  alphaValue: { type: String },
  encryptedBallot: { type: String },
  nizkpokProof: { type: String },
  shuffleProofValid: { type: Boolean, default: true },
  quorumHash: { type: String },
  // WBB publication
  publishedToWBB: { type: Boolean, default: false },
  wbbTimestamp: { type: Date },
  // Verification
  voterVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verificationResult: { type: String, enum: ['authentic', 'fraud', null], default: null },
  castAt: { type: Date, default: Date.now },
});

// Index for fast tracker lookups
voteSchema.index({ tracker: 1 });
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
