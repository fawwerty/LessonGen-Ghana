// routes/admin.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  const [totalUsers, paidUsers, totalLessons] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: { $ne: 'free' } }),
    Lesson.countDocuments()
  ]);
  const subjectStats = await Lesson.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 }
  ]);
  res.json({ success: true, stats: { totalUsers, paidUsers, totalLessons, subjectStats } });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, users });
});

module.exports = router;
