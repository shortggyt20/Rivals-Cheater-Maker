const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetRobloxId: { type: String, required: true, index: true },
    targetUsername: { type: String, required: true, trim: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classification: {
      type: String,
      enum: ['clean', 'suspicious', 'likely_cheater'],
      required: true
    },
    reason: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    evidencePath: { type: String, required: true },
    evidenceMimeType: { type: String, required: true },
    moderatorWeight: { type: Number, default: 1, min: 0, max: 5 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'removed'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    moderationNote: { type: String, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

reportSchema.index({ targetRobloxId: 1, reporter: 1, reason: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
