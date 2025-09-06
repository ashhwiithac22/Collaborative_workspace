const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['editor', 'viewer'],
    default: 'editor'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Index for faster queries
inviteSchema.index({ token: 1 });
inviteSchema.index({ recipientEmail: 1, status: 1 });

module.exports = mongoose.model('Invite', inviteSchema);