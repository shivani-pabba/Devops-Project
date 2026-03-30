const mongoose = require('mongoose');

const wbbEntrySchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  tracker: { type: String, required: true },
  vote: { type: String, required: true },
  quorumHash: { type: String, required: true },
  nizkpokProof: { type: String, required: true },
  shuffleRound: { type: Number, default: 1 },
  nodeConsensus: { type: Number, default: 4 },
  totalNodes: { type: Number, default: 4 },
  timestamp: { type: Date, default: Date.now },
});

wbbEntrySchema.index({ tracker: 1 });
wbbEntrySchema.index({ election: 1 });

module.exports = mongoose.model('WBBEntry', wbbEntrySchema);
