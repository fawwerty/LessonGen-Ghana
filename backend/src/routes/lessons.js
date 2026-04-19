// routes/lessons.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { generateLesson, CLASS_LABEL } = require('../services/aiService');
const Lesson = require('../models/Lesson');
const LessonBatch = require('../models/LessonBatch');
const router = express.Router();

// POST /api/lessons/generate
// Accepts either a single object or an array of subject configurations
router.post('/generate', protect, async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  
  if (!payload.length) {
    return res.status(400).json({ success: false, message: 'No subjects provided for generation' });
  }

  try {
    const savedLessons = [];
    const term = payload[0].term;
    const week = payload[0].week;

    for (const item of payload) {
      if (!item.classCode || !item.subject || !item.term || !item.week) {
        throw new Error('Class, subject, term and week are required for all items');
      }

      const { lesson, curriculum, isJHS } = await generateLesson({ 
        classCode: item.classCode, 
        subject: item.subject, 
        term: Number(item.term), 
        week: Number(item.week), 
        style: item.style || 'Standard', 
        extra: item.extra || '',
        teachingDays: item.teachingDays || null,
        periods: item.periods || null
      });

      const saved = await Lesson.create({
        userId: req.user._id, 
        classCode: item.classCode, 
        className: CLASS_LABEL[item.classCode] || item.classCode,
        subject: item.subject, 
        term: Number(item.term), 
        week: Number(item.week), 
        style: item.style || 'Standard',
        weekEnding: lesson.weekEnding, 
        strand: lesson.strand || curriculum.strand,
        subStrand: lesson.subStrand || curriculum.subStrand, 
        contentStandard: lesson.contentStandard || curriculum.contentStd,
        indicator: lesson.indicator || curriculum.indicator, 
        performanceIndicator: lesson.performanceIndicator,
        teachingResources: lesson.teachingResources, 
        coreCompetencies: lesson.coreCompetencies,
        reference: lesson.reference || curriculum.reference, 
        duration: lesson.duration || curriculum.duration,
        classSize: lesson.classSize || curriculum.classSize, 
        keywords: lesson.keywords,
        days: lesson.days || [{ day: lesson.day || 'Thursday', phase1: lesson.phase1, phase2: lesson.phase2, phase3: lesson.phase3 }],
        isValid: true
      });
      savedLessons.push(saved);
    }

    // Create a batch record if more than 1 lesson was generated
    let batchId = null;
    if (savedLessons.length > 1) {
       const batch = await LessonBatch.create({
         userId: req.user._id,
         name: `Term ${term} Week ${week} Batch (${savedLessons.length} Subjects)`,
         term: Number(term),
         week: Number(week),
         lessons: savedLessons.map(l => l._id)
       });
       batchId = batch._id;
    }

    res.json({ success: true, lessons: savedLessons, batchId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/lessons - user's lessons
router.get('/', protect, async (req, res) => {
  const { search, subject, classCode, page = 1, limit = 20 } = req.query;
  const query = { userId: req.user._id };
  if (subject) query.subject = subject;
  if (classCode) query.classCode = classCode;
  if (search) query.$or = [{ subject: new RegExp(search,'i') }, { strand: new RegExp(search,'i') }];
  const lessons = await Lesson.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  const total = await Lesson.countDocuments(query);
  res.json({ success: true, lessons, total, pages: Math.ceil(total/limit) });
});

// GET /api/lessons/:id
router.get('/:id', protect, async (req, res) => {
  const lesson = await Lesson.findOne({ _id: req.params.id, userId: req.user._id });
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
  res.json({ success: true, lesson });
});

// DELETE /api/lessons/:id
router.delete('/:id', protect, async (req, res) => {
  await Lesson.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true, message: 'Lesson deleted' });
});

// GET /api/lessons/batch/:id
router.get('/batch/:id', protect, async (req, res) => {
  const batch = await LessonBatch.findOne({ _id: req.params.id, userId: req.user._id }).populate('lessons');
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  res.json({ success: true, batch });
});

module.exports = router;
