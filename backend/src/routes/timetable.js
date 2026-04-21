// routes/timetable.js
const express = require('express');
const multer  = require('multer');
const { protect } = require('../middleware/auth');
const Timetable = require('../models/Timetable');
const { parseTimetable } = require('../services/visionService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/timetable/upload
router.post('/upload', protect, upload.single('timetableFile'), async (req, res) => {
  const { classCode } = req.body;
  if (!req.file || !classCode) {
    return res.status(400).json({ success: false, message: 'Missing file or classCode.' });
  }

  try {
    // 1. Parse with AI
    const { schedule, rawText } = await parseTimetable(req.file.buffer, req.file.mimetype);

    // 2. Save or Update
    const timetable = await Timetable.findOneAndUpdate(
      { userId: req.user._id, classCode },
      { 
        schedule, 
        rawText, 
        originalFileName: req.file.originalname,
        sourceType: 'file',
        status: 'ready',
        parsedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, timetable });
  } catch (err) {
    console.error('Timetable upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to process timetable.' });
  }
});

// GET /api/timetable/:classCode
router.get('/:classCode', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.user._id, classCode: req.params.classCode });
    if (!timetable) return res.status(404).json({ success: false, message: 'No timetable found for this class.' });
    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving timetable.' });
  }
});

// DELETE /api/timetable/:classCode
router.delete('/:classCode', protect, async (req, res) => {
  try {
    await Timetable.findOneAndDelete({ userId: req.user._id, classCode: req.params.classCode });
    res.json({ success: true, message: 'Timetable deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete timetable.' });
  }
});

module.exports = router;
