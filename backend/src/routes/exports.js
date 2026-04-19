// routes/exports.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { buildDocx } = require('../services/docxService');
const Lesson = require('../models/Lesson');
const LessonBatch = require('../models/LessonBatch');
const User = require('../models/User');
const router = express.Router();

function getLessonPayload(lesson) {
  const isJHS = ['B7','B8','B9'].includes(lesson.classCode);
  return {
    classCode: lesson.classCode, className: lesson.className, subject: lesson.subject,
    term: lesson.term, week: lesson.week, isJHS,
    lesson: {
      weekEnding: lesson.weekEnding, strand: lesson.strand, subStrand: lesson.subStrand,
      contentStandard: lesson.contentStandard, indicator: lesson.indicator,
      performanceIndicator: lesson.performanceIndicator, teachingResources: lesson.teachingResources,
      coreCompetencies: lesson.coreCompetencies, reference: lesson.reference,
      duration: lesson.duration, classSize: lesson.classSize, keywords: lesson.keywords,
      days: lesson.days, day: lesson.days?.[0]?.day || 'Thursday',
      phase1: lesson.days?.[0]?.phase1, phase2: lesson.days?.[0]?.phase2, phase3: lesson.days?.[0]?.phase3,
      resources: lesson.teachingResources, lessonNumber: '1 of 1'
    }
  };
}

async function handleExportAnalytics(user, lessonIds) {
  if (user.plan === 'free' && !user.freeExportUsed) {
    await User.findByIdAndUpdate(user._id, { freeExportUsed: true, $inc: { exportCount: 1 } });
  } else {
    await User.findByIdAndUpdate(user._id, { $inc: { exportCount: 1 } });
  }
  await Lesson.updateMany({ _id: { $in: lessonIds } }, { $inc: { exportCount: 1 } });
}

// Export single lesson
router.post('/docx/:lessonId', protect, async (req, res) => {
  const user = req.user;
  if (!user.canExport()) {
    return res.status(402).json({ success: false, message: 'PAYMENT_REQUIRED', code: 'UPGRADE_NEEDED' });
  }
  const lesson = await Lesson.findOne({ _id: req.params.lessonId, userId: user._id });
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

  const lessonData = getLessonPayload(lesson);
  const buffer = await buildDocx([lessonData]);

  await handleExportAnalytics(user, [lesson._id]);

  const filename = `LessonNote_${lesson.classCode}_${lesson.subject.replace(/\s+/g,'_')}_T${lesson.term}_W${lesson.week}.docx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

// Export batch of lessons
router.post('/batch/:batchId', protect, async (req, res) => {
  const user = req.user;
  if (!user.canExport()) {
    return res.status(402).json({ success: false, message: 'PAYMENT_REQUIRED', code: 'UPGRADE_NEEDED' });
  }

  const batch = await LessonBatch.findOne({ _id: req.params.batchId, userId: user._id }).populate('lessons');
  if (!batch || !batch.lessons.length) return res.status(404).json({ success: false, message: 'Batch not found or empty' });

  const lessonDataArray = batch.lessons.map(getLessonPayload);
  const buffer = await buildDocx(lessonDataArray);

  await handleExportAnalytics(user, batch.lessons.map(l => l._id));

  const filename = `LessonBatch_T${batch.term}_W${batch.week}_${batch.lessons.length}_Subjects.docx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = router;
