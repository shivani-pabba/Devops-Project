const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['voter', 'admin', 'auditor'], default: 'voter' },
  voterCredential: { type: String },     // e.g. CES-2024-XXXXX
  betaCommitment: { type: String },      // β from email
  alphaValue: { type: String },          // α after election
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  hasVoted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
