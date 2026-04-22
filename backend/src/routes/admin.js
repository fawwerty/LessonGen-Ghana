// routes/admin.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Log = require('../models/Log');
const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  const [totalUsers, paidUsers, totalLessons, logs] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: { $ne: 'free' } }),
    Lesson.countDocuments(),
    Log.find({ type: { $in: ['ai_cache_hit', 'ai_cache_miss', 'webhook'] } })
      .sort({ createdAt: -1 })
      .limit(500)
  ]);

  // Derived Metrics
  const aiCache = {
    hits: logs.filter(l => l.type === 'ai_cache_hit').length,
    misses: logs.filter(l => l.type === 'ai_cache_miss').length,
  };
  aiCache.total = aiCache.hits + aiCache.misses;
  aiCache.hitRate = aiCache.total > 0 ? Math.round((aiCache.hits / aiCache.total) * 100) : 0;

  const payments = {
    successCount: logs.filter(l => l.type === 'webhook' && l.status === 'success' && l.payload?.event === 'charge.success').length,
    recentFailures: logs.filter(l => l.type === 'webhook' && l.status === 'failure').slice(0, 10)
  };

  const subjectStats = await Lesson.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 }
  ]);

  res.json({ 
    success: true, 
    stats: { 
      totalUsers, 
      paidUsers, 
      totalLessons, 
      subjectStats,
      aiCache,
      payments,
      system: {
        uptime: process.uptime(),
        errorRate: logs.filter(l => l.status === 'failure').length / (logs.length || 1)
      }
    } 
  });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, users });
});

module.exports = router;
