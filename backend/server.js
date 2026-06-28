require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security headers (helmet) ──────────────────────────────────────────────
app.use(helmet());

// ── Dynamic CORS configuration supporting Vercel Wildcards ────────────────
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps, Postman, or curl)
    // 2. Allow local Vite development environments (e.g., localhost:5173, localhost:3000)
    if (!origin || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // 3. Regex to match your main production domain AND all dynamic Vercel preview/branch builds
    // Captures domains starting with 'https://vriddhi-' and ending with '.vercel.app'
    const isVercelDomain = /^https:\/\/vriddhi-.*\.vercel\.app$/.test(origin);

    if (isVercelDomain) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Vriddhi Production CORS Security Firewall'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate limiting — 100 requests per 15 min per IP ────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again after 15 minutes.' },
});
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── Strict Production DB Connection (fail-fast) ───────────────────────────
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ CRITICAL: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Production MongoDB Atlas Cluster Connected Successfully.');
  } catch (error) {
    console.error('❌ CRITICAL DATABASE CONNECTION FAILURE:', error.message);
    process.exit(1); // Force crash immediately — hosting monitor will alert
  }
}

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
});