const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  // 'otp' for registration, 'reset' for password recovery
  type: {
    type: String,
    enum: ['otp', 'reset'],
    default: 'otp',
  },
  // MongoDB TTL: document auto-deletes when expiresAt is reached
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
