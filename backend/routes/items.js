const express = require('express');
const router = express.Router();
const multer = require('multer');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

// Configure multer to keep uploads in memory (no local disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const mime = allowed.test(file.mimetype);
    if (mime) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

// GET /api/items - fetch all items (photo excluded for performance)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch all items excluding the heavy photo string for fast sync
    const items = await Item.find({ shopId: req.user.shopId })
      .select('-photo')
      .lean()
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items.' });
  }
});

// GET /api/items/:id/photo - lazy-load a single item's photo on demand
router.get('/:id/photo', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne(
      { _id: req.params.id, shopId: req.user.shopId },
      'photo'
    );
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ photo: item.photo || '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch photo.' });
  }
});

// POST /api/items - create a new item
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name, sellingPrice } = req.body;

    if (!name || !sellingPrice) {
      return res.status(400).json({ message: 'Name and selling price are required.' });
    }

    // Encode uploaded file as a Base64 Data URI for MongoDB storage
    let photo = '';
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      photo = `data:${req.file.mimetype};base64,${base64}`;
    }

    const item = await Item.create({
      name,
      sellingPrice: parseFloat(sellingPrice),
      photo,
      shopId: req.user.shopId,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: 'Failed to create item.' });
  }
});

// PUT /api/items/:id - update an item
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name, sellingPrice } = req.body;
    const update = { name, sellingPrice };

    // If a new file was uploaded, encode it and replace the stored photo
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      update.photo = `data:${req.file.mimetype};base64,${base64}`;
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      update,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item.' });
  }
});

// DELETE /api/items/:id - delete an item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, shopId: req.user.shopId });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item.' });
  }
});

module.exports = router;
