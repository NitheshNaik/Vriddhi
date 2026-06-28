const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const authMiddleware = require('../middleware/auth');

// GET /api/analytics - aggregated stats + drill-down transaction lists
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const now = new Date();

    // ── Time boundaries ────────────────────────────────────────────────────
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const toOid = (id) => require('mongoose').Types.ObjectId.createFromHexString(id.toString());

    // ── Aggregate summaries ────────────────────────────────────────────────
    const [todayAgg, weekAgg, monthAgg] = await Promise.all([
      Sale.aggregate([
        { $match: { shopId: toOid(shopId), timestamp: { $gte: todayStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalRevenue' }, count: { $sum: '$quantitySold' } } },
      ]),
      Sale.aggregate([
        { $match: { shopId: toOid(shopId), timestamp: { $gte: weekStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalRevenue' }, count: { $sum: '$quantitySold' } } },
      ]),
      Sale.aggregate([
        { $match: { shopId: toOid(shopId), timestamp: { $gte: monthStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalRevenue' }, count: { $sum: '$quantitySold' } } },
      ]),
    ]);

    // ── 7-day daily trend ──────────────────────────────────────────────────
    const trendAgg = await Sale.aggregate([
      { $match: { shopId: toOid(shopId), timestamp: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            year:  { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day:   { $dayOfMonth: '$timestamp' },
          },
          revenue: { $sum: '$totalRevenue' },
          count:   { $sum: '$quantitySold' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Fill missing days with 0 for a complete 7-day array
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      const found = trendAgg.find(
        t => t._id.year === key.year && t._id.month === key.month && t._id.day === key.day
      );
      trend.push({
        date:    d.toISOString().split('T')[0],
        label:   d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: found ? parseFloat(found.revenue.toFixed(2)) : 0,
        count:   found ? found.count : 0,
      });
    }

    // ── Top sellers (this month) ───────────────────────────────────────────
    const topItemsAgg = await Sale.aggregate([
      { $match: { shopId: toOid(shopId), timestamp: { $gte: monthStart } } },
      { $group: { _id: '$itemId', itemName: { $first: '$itemName' }, totalQty: { $sum: '$quantitySold' }, totalRevenue: { $sum: '$totalRevenue' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // ── Recent transactions (last 10) ──────────────────────────────────────
    const recentSales = await Sale.find({ shopId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // ── Drill-down transaction lists ───────────────────────────────────────
    // Full transaction arrays for "This Week" and "This Month" breakdown cards
    const [weekSales, monthSales] = await Promise.all([
      Sale.find({ shopId, timestamp: { $gte: weekStart } })
        .sort({ timestamp: -1 })
        .limit(200)
        .select('itemName quantitySold totalRevenue paymentMethod timestamp')
        .lean(),
      Sale.find({ shopId, timestamp: { $gte: monthStart } })
        .sort({ timestamp: -1 })
        .limit(200)
        .select('itemName quantitySold totalRevenue paymentMethod timestamp')
        .lean(),
    ]);

    res.json({
      today:      todayAgg[0]  || { revenue: 0, count: 0 },
      week:       weekAgg[0]   || { revenue: 0, count: 0 },
      month:      monthAgg[0]  || { revenue: 0, count: 0 },
      trend,
      topItems:   topItemsAgg,
      recentSales,
      weekSales,
      monthSales,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to generate analytics.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/historical?type=month|week
// Returns all historical periods (since account creation) newest-first,
// each with: summary, topSeller, paymentSplit, and full sales list.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/historical', authMiddleware, async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const type   = req.query.type === 'week' ? 'week' : 'month';
    const toOid  = (id) => require('mongoose').Types.ObjectId.createFromHexString(id.toString());
    const shopOid = toOid(shopId);

    // ── 1. Get distinct period keys ──────────────────────────────────────────
    // For month: "2026-06"  |  For week: "2026-W26"
    const periodGroup = type === 'month'
      ? { $dateToString: { format: '%Y-%m', date: '$timestamp', timezone: 'Asia/Kolkata' } }
      : {
          $concat: [
            { $toString: { $isoWeekYear: { date: '$timestamp', timezone: 'Asia/Kolkata' } } },
            '-W',
            {
              $cond: [
                { $lte: [{ $isoWeek: { date: '$timestamp', timezone: 'Asia/Kolkata' } }, 9] },
                {
                  $concat: [
                    '0',
                    { $toString: { $isoWeek: { date: '$timestamp', timezone: 'Asia/Kolkata' } } },
                  ],
                },
                { $toString: { $isoWeek: { date: '$timestamp', timezone: 'Asia/Kolkata' } } },
              ],
            },
          ],
        };

    // ── 2. Summary aggregation per period ────────────────────────────────────
    const summaryAgg = await Sale.aggregate([
      { $match: { shopId: shopOid } },
      {
        $group: {
          _id: periodGroup,
          totalRevenue: { $sum: '$totalRevenue' },
          totalQty:     { $sum: '$quantitySold' },
          minTs:        { $min: '$timestamp' },
          maxTs:        { $max: '$timestamp' },
        },
      },
      { $sort: { _id: -1 } },  // newest period first
    ]);

    if (summaryAgg.length === 0) {
      return res.json([]);
    }

    // ── 3. For each period, fetch topSeller + paymentSplit + sales ───────────
    const periods = await Promise.all(
      summaryAgg.map(async (period) => {
        const periodKey = period._id;

        // Build a date range from minTs / maxTs that covers the full period
        let startDate, endDate;
        if (type === 'month') {
          // periodKey like "2026-06"
          const [yr, mo] = periodKey.split('-').map(Number);
          startDate = new Date(yr, mo - 1, 1, 0, 0, 0, 0);
          endDate   = new Date(yr, mo,     1, 0, 0, 0, 0); // exclusive
        } else {
          // For week we use the minTs/maxTs rounded to week boundaries
          // Use aggregation $match on the same periodKey expression for accuracy
          startDate = null; // handled by periodKey filter below
          endDate   = null;
        }

        // Match filter — re-use same period expression to stay accurate
        const matchStage = startDate
          ? { shopId: shopOid, timestamp: { $gte: startDate, $lt: endDate } }
          : { shopId: shopOid }; // week: filter in pipeline

        // Top seller for this period
        const topSellerPipeline = [
          { $match: { shopId: shopOid } },
          { $addFields: { periodKey: periodGroup } },
          { $match: { periodKey } },
          {
            $group: {
              _id:          '$itemId',
              itemName:     { $first: '$itemName' },
              qty:          { $sum: '$quantitySold' },
              revenue:      { $sum: '$totalRevenue' },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 1 },
        ];

        // Payment split for this period
        const splitPipeline = [
          { $match: { shopId: shopOid } },
          { $addFields: { periodKey: periodGroup } },
          { $match: { periodKey } },
          {
            $group: {
              _id:     '$paymentMethod',
              revenue: { $sum: '$totalRevenue' },
              qty:     { $sum: '$quantitySold' },
            },
          },
        ];

        // All sales for this period (up to 500, newest-first)
        const salesPipeline = [
          { $match: { shopId: shopOid } },
          { $addFields: { periodKey: periodGroup } },
          { $match: { periodKey } },
          { $sort: { timestamp: -1 } },
          { $limit: 500 },
          { $project: { itemName: 1, quantitySold: 1, totalRevenue: 1, paymentMethod: 1, timestamp: 1 } },
        ];

        const [topSellerArr, splitArr, salesArr] = await Promise.all([
          Sale.aggregate(topSellerPipeline),
          Sale.aggregate(splitPipeline),
          Sale.aggregate(salesPipeline),
        ]);

        // Normalise payment split
        const paymentSplit = { upi: 0, cash: 0, card: 0 };
        splitArr.forEach(s => {
          const key = (s._id || 'cash').toLowerCase();
          if (paymentSplit[key] !== undefined) paymentSplit[key] = parseFloat(s.revenue.toFixed(2));
        });

        // Build human-readable label
        let label;
        if (type === 'month') {
          const [yr, mo] = periodKey.split('-').map(Number);
          label = new Date(yr, mo - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        } else {
          // week: "22 Jun – 28 Jun 2026"
          const minDate = period.minTs;
          const maxDate = period.maxTs;
          const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });
          const yearStr = new Date(maxDate).toLocaleString('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' });
          label = `${fmt(minDate)} – ${fmt(maxDate)} ${yearStr}`;
        }

        return {
          periodKey,
          label,
          totalRevenue:  parseFloat(period.totalRevenue.toFixed(2)),
          totalQty:      period.totalQty,
          topSeller:     topSellerArr[0] ? {
            itemName: topSellerArr[0].itemName,
            qty:      topSellerArr[0].qty,
            revenue:  parseFloat(topSellerArr[0].revenue.toFixed(2)),
          } : null,
          paymentSplit,
          sales: salesArr,
        };
      })
    );

    res.json(periods);
  } catch (err) {
    console.error('Historical analytics error:', err);
    res.status(500).json({ message: 'Failed to generate historical analytics.' });
  }
});

module.exports = router;

