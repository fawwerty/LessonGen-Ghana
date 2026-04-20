const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lesson = require('../models/Lesson');
const Scheme = require('../models/Scheme');
const { authAPI } = require('../../mobile/src/services/api'); // Ignore this line, just for reference if needed

router.get('/ping', (req, res) => res.json({ success: true, message: 'Dashboard router is alive' }));

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [lessonCount, schemeCount, recentLessons] = await Promise.all([
      Lesson.countDocuments({ user: userId }),
      Scheme.countDocuments({ user: userId }),
      Lesson.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('subject classCode createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        lessons: lessonCount,
        schemes: schemeCount,
        subscription: req.user.role === 'pro' ? 'PRO' : 'Free'
      },
      recentLessons
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
