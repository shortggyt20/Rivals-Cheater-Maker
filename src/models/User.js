const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    robloxId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'banned', 'shadow'], default: 'user' },
    trustScore: { type: Number, default: 0.5, min: 0, max: 1 },
    accountAgeDays: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now },
    abuseScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
