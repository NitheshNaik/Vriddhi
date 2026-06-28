const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

// POST /api/sales - record one or more sales
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sales } = req.body; // Array of { itemId, quantitySold, pricePerUnit, paymentMethod }

    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ message: 'Sales array is required.' });
    }

    const createdSales = [];

    for (const saleData of sales) {
      const { itemId, quantitySold, paymentMethod, pricePerUnit } = saleData;

      if (!itemId || !quantitySold || quantitySold < 1) {
        return res.status(400).json({ message: 'Each sale requires itemId and quantitySold >= 1.' });
      }

      // Fetch item to resolve default selling price if pricePerUnit is not supplied
      const item = await Item.findOne({ _id: itemId, shopId: req.user.shopId });
      if (!item) {
        return res.status(404).json({ message: `Item ${itemId} not found.` });
      }

      // Use the client-supplied pricePerUnit if provided, otherwise fall back to stored sellingPrice
      const effectiveSellingPrice = (pricePerUnit != null && !isNaN(parseFloat(pricePerUnit)))
        ? parseFloat(pricePerUnit)
        : item.sellingPrice;

      const totalRevenue = quantitySold * effectiveSellingPrice;

      const sale = await Sale.create({
        itemId,
        itemName: item.name,
        quantitySold,
        totalRevenue,
        paymentMethod: paymentMethod || 'cash',
        shopId: req.user.shopId,
        timestamp: new Date(),
      });

      createdSales.push(sale);
    }

    res.status(201).json({ message: 'Sale recorded successfully.', sales: createdSales });
  } catch (err) {
    console.error('Sale error:', err);
    res.status(500).json({ message: 'Failed to record sale.' });
  }
});

// GET /api/sales - fetch recent sales
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sales = await Sale.find({ shopId: req.user.shopId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('itemId', 'name photo');

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales.' });
  }
});

module.exports = router;
