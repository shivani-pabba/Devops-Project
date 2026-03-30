const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['setup', 'active', 'mixing', 'closed', 'verified'],
    default: 'setup',
  },
  startDate: { type: Date },
  endDate: { type: Date },
  options: [{ type: String }],           // e.g. ['YES','NO','ABSTAIN']
  totalRegistered: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  totalVerified: { type: Number, default: 0 },
  // Crypto params
  keyLength: { type: Number, default: 3027 },
  encryptionScheme: { type: String, default: 'ElGamal (k,t)-threshold' },
  signatureAlgorithm: { type: String, default: 'DSA (NIST FIPS 186-5)' },
  mixnetImpl: { type: String, default: 'Verificatum' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Election', electionSchema);
