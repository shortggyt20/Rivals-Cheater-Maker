const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema(
  {
    targetRobloxId: { type: String, required: true, index: true },
    contact: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    status: { type: String, enum: ['open', 'accepted', 'rejected'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appeal', appealSchema);
