const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const EmailVerification = require('../models/EmailVerification');
const authMiddleware = require('../middleware/auth');
const { sendOtpEmail, sendResetEmail } = require('../utils/mailer');
const multer = require('multer');

// ── Multer: memory storage for profile photo uploads ──────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// ── Password strength regex ────────────────────────────────────────────────
// Requires: ≥1 uppercase, ≥1 digit, ≥1 special char (@#$%&*!), ≥8 chars total
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{8,}$/;

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp
// Step 1 of registration: validate inputs, send 6-digit OTP to email
// ────────────────────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { shopName, ownerName, email, password } = req.body;

    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$%&*!).',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Generate 6-digit OTP and upsert into EmailVerification
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await EmailVerification.findOneAndUpdate(
      { email: email.toLowerCase(), type: 'otp' },
      { code: otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email.toLowerCase(), otp);

    res.json({ message: 'OTP sent successfully. Check your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please check your email address and try again.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-and-register
// Step 2 of registration: verify OTP, create user, return JWT
// ────────────────────────────────────────────────────────────────────────────
router.post('/verify-and-register', async (req, res) => {
  try {
    const { shopName, ownerName, email, password, otp } = req.body;

    if (!shopName || !ownerName || !email || !password || !otp) {
      return res.status(400).json({ message: 'All fields including OTP are required.' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$%&*!).',
      });
    }

    // Find and validate OTP
    const record = await EmailVerification.findOne({
      email: email.toLowerCase(),
      type: 'otp',
    });

    if (!record) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }
    if (record.code !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }
    if (record.expiresAt < new Date()) {
      await EmailVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check again for duplicate account
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      shopName,
      ownerName,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Clean up OTP record
    await EmailVerification.deleteOne({ _id: record._id });

    // Seed starter items
    const starterItems = [
      { name: 'School Bag',  sellingPrice: 550,  photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', shopId: user._id },
      { name: 'Luggage Bag', sellingPrice: 1200, photo: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=400&q=80', shopId: user._id },
      { name: 'Seat Cover',  sellingPrice: 450,  photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', shopId: user._id },
      { name: 'Repair',      sellingPrice: 150,  photo: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', shopId: user._id },
      { name: 'Belt',        sellingPrice: 250,  photo: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80', shopId: user._id },
      { name: 'Cap',         sellingPrice: 180,  photo: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80', shopId: user._id },
    ];
    await Item.insertMany(starterItems);

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, shopId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, shopName: user.shopName, ownerName: user.ownerName, email: user.email },
    });
  } catch (err) {
    console.error('Verify-and-register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, shopId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, shopName: user.shopName, ownerName: user.ownerName, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Sends a password reset link to the registered email
// ────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await EmailVerification.findOneAndUpdate(
      { email: email.toLowerCase(), type: 'reset' },
      { code: rawToken, expiresAt },
      { upsert: true, new: true }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email.toLowerCase())}`;
    await sendResetEmail(email.toLowerCase(), resetLink);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Validates reset token and updates password
// ────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$%&*!).',
      });
    }

    const record = await EmailVerification.findOne({
      email: email.toLowerCase(),
      type: 'reset',
    });

    if (!record || record.code !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }
    if (record.expiresAt < new Date()) {
      await EmailVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    // Revoke the reset token
    await EmailVerification.deleteOne({ _id: record._id });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // If the authMiddleware passes, req.user payload contains the authenticated shopkeeper ID
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(401).json({ message: "Expired or invalid credentials session." });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/auth/profile
// ────────────────────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile
// ────────────────────────────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { shopName, ownerName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { shopName, ownerName },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/profile/photo
// Upload & persist a base64 profile photo
// ────────────────────────────────────────────────────────────────────────────
router.post(
  '/profile/photo',
  authMiddleware,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided.' });
      }

      // Convert buffer -> base64 data URI
      const mime   = req.file.mimetype;
      const b64    = req.file.buffer.toString('base64');
      const dataURI = `data:${mime};base64,${b64}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePhoto: dataURI },
        { new: true }
      ).select('-passwordHash');

      res.json(user);
    } catch (err) {
      console.error('Profile photo upload error:', err);
      res.status(500).json({ message: 'Failed to upload profile photo.' });
    }
  }
);

module.exports = router;
