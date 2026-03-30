require('dotenv').config({ path: '../.env.example' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const WBBEntry = require('../models/WBBEntry');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vmv_voting';

const genTracker = (i) => String(47829163 + i).padStart(8, '0');
const genHash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const genProof = (s) => crypto.randomBytes(16).toString('hex');

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clean
  await Promise.all([User.deleteMany(), Election.deleteMany(), Vote.deleteMany(), WBBEntry.deleteMany()]);
  console.log('Cleaned collections');

  // Create election
  const election = await Election.create({
    title: 'Surrey CS Dept Rep · Jun 2019',
    description: 'Student representative election using the Selene VMV protocol.',
    status: 'active',
    startDate: new Date('2019-06-01'),
    endDate: new Date('2019-06-30'),
    options: ['YES', 'NO', 'ABSTAIN'],
    totalRegistered: 4821,
    totalVotes: 3614,
    totalVerified: 612,
  });
  console.log('Election created:', election._id);

  // Create admin
  const admin = await User.create({
    name: 'Admin Selene',
    email: 'admin@vmv.test',
    password: 'selene@admin2024',
    role: 'admin',
    voterCredential: 'VMV-ADM-001',
  });

  // Create auditor
  await User.create({
    name: 'Audit Org',
    email: 'auditor@vmv.test',
    password: 'audit@2024',
    role: 'auditor',
    voterCredential: 'AUDIT-TKN-8829A',
  });

  // Voter profiles
  const voterData = [
    { name: 'Alice Powell', email: 'alice@vmv.test', credential: 'CES-2024-48291', beta: '3f9c8e1d2b47a6f0', alpha: '7b2e4f1a9c5d3e', voteChoice: 'YES', tracker: genTracker(0) },
    { name: 'Bob Chen', email: 'bob@vmv.test', credential: 'CES-2024-48292', beta: '9a1b2c3d4e5f6a7b', alpha: '2c4d6e8f0a1b3c', voteChoice: 'NO', tracker: genTracker(1) },
    { name: 'Carol Smith', email: 'carol@vmv.test', credential: 'CES-2024-48293', beta: 'b4c5d6e7f8a9b0c1', alpha: '5f7a9b1c3d5e7f', voteChoice: 'YES', tracker: genTracker(2) },
    { name: 'Dan Jones', email: 'dan@vmv.test', credential: 'CES-2024-48294', beta: 'c1d2e3f4a5b6c7d8', alpha: '8a0b2c4d6e8f0a', voteChoice: 'ABSTAIN', tracker: genTracker(3) },
    { name: 'Eve Martin', email: 'eve@vmv.test', credential: 'CES-2024-48295', beta: 'd8e9f0a1b2c3d4e5', alpha: '1b3c5d7e9f1a3b', voteChoice: 'YES', tracker: genTracker(4) },
  ];

  for (const v of voterData) {
    const quorumHash = genHash(v.tracker + v.voteChoice + v.beta);
    const nizkpok = genProof(v.tracker);

    const user = await User.create({
      name: v.name,
      email: v.email,
      password: 'voter@2024',
      role: 'voter',
      voterCredential: v.credential,
      betaCommitment: v.beta,
      alphaValue: v.alpha,
      electionId: election._id,
      hasVoted: true,
    });

    await Vote.create({
      election: election._id,
      voter: user._id,
      tracker: v.tracker,
      choice: v.voteChoice,
      betaCommitment: v.beta,
      alphaValue: v.alpha,
      encryptedBallot: genHash('enc' + v.voteChoice + v.tracker),
      nizkpokProof: nizkpok,
      shuffleProofValid: true,
      quorumHash,
      publishedToWBB: true,
      wbbTimestamp: new Date(),
    });

    await WBBEntry.create({
      election: election._id,
      tracker: v.tracker,
      vote: v.voteChoice,
      quorumHash,
      nizkpokProof: nizkpok,
    });

    console.log(`Voter seeded: ${v.name} | tracker: ${v.tracker} | vote: ${v.voteChoice}`);
  }

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Voter:   alice@vmv.test / voter@2024');
  console.log('  Admin:   admin@vmv.test / selene@admin2024');
  console.log('  Auditor: auditor@vmv.test / audit@2024');
  console.log('─────────────────────────────────────────');
  mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
