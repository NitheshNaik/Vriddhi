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

// ── CORS — locked to FRONTEND_URL env var ─────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
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

// Connect to MongoDB - with automatic in-memory fallback
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkeeper';

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
  } catch (err) {
    console.warn('⚠️  Real MongoDB unavailable. Starting in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ In-memory MongoDB started successfully');

      // Seed demo data on fresh in-memory instance
      await seedDemoData();
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
}

// Seed demo shop + items so the app is immediately useful
async function seedDemoData() {
  try {
    const User = require('./models/User');
    const Item = require('./models/Item');
    const bcrypt = require('bcryptjs');

    const existingUser = await User.findOne({ email: 'demo@shopkeeper.com' });
    if (existingUser) return;

    const passwordHash = await bcrypt.hash('demo1234', 10);
    const user = await User.create({
      shopName: "Smith's Bodega",
      ownerName: 'John Smith',
      email: 'demo@shopkeeper.com',
      passwordHash,
    });

    const demoItems = [
      { name: 'School Bag',  sellingPrice: 550,  photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', shopId: user._id },
      { name: 'Luggage Bag', sellingPrice: 1200, photo: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=400&q=80', shopId: user._id },
      { name: 'Seat Cover',  sellingPrice: 450,  photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', shopId: user._id },
      { name: 'Repair',      sellingPrice: 150,  photo: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', shopId: user._id },
      { name: 'Belt',        sellingPrice: 250,  photo: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80', shopId: user._id },
      { name: 'Cap',         sellingPrice: 180,  photo: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80', shopId: user._id },
    ];

    await Item.insertMany(demoItems);
    console.log('✅ Demo data seeded: demo@shopkeeper.com / demo1234');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
});
