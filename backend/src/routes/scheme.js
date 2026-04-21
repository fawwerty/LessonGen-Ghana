// routes/scheme.js
const express = require('express');
const multer  = require('multer');
const { protect } = require('../middleware/auth');
const Scheme  = require('../models/Scheme');
const Lesson  = require('../models/Lesson');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateLessonFromScheme, CLASS_LABEL } = require('../services/aiService');
const { extractTextFromImage } = require('../services/visionService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Optional parsers
let pdfParse = null;
let mammoth  = null;
try { pdfParse = require('pdf-parse'); } catch {}
try { mammoth  = require('mammoth');   } catch {}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// ── Shared: AI parses raw text into weekly breakdown ─────────────────────────
async function parseSchemeText(rawText, classCode, subject, term) {
  const truncated = rawText.substring(0, 30000);
  const prompt = `You are an expert Ghanaian NaCCA curriculum specialist. Analyze the following Termly Scheme of Work (TSoW) document for Class ${classCode}, Subject: ${subject}, Term ${term}.

Break it into a structured week-by-week breakdown. Extract exactly what is written for each week.
If a week is not explicitly mentioned, infer logically from context.
Output between 8 and 15 weeks.

Output ONLY valid JSON array (no markdown, no explanation):
[
  {
    "week": 1,
    "strand": "exact strand name",
    "subStrand": "exact sub-strand",
    "contentStandard": "e.g. B4.1.1.1",
    "indicator": "e.g. B4.1.1.1.1",
    "performanceIndicator": "Learners will be able to...",
    "topics": ["Main topic", "Sub-topic"],
    "keyWords": ["keyword1", "keyword2"]
  }
]

Document content:
${truncated}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const breakdown = JSON.parse(text);
      if (Array.isArray(breakdown) && breakdown.length > 0) return breakdown;
    } catch (e) {
      if (attempt === 2) throw new Error('Failed to parse scheme after 3 attempts');
    }
  }
}

// ── POST /api/scheme/upload ─────────────────────────────────────────────────
router.post('/upload', protect, upload.single('schemeFile'), async (req, res) => {
  const { classCode, subject, term } = req.body;
  if (!req.file || !classCode || !subject || !term) {
    return res.status(400).json({ success: false, message: 'Missing file or required parameters (classCode, subject, term).' });
  }

  // Create a "parsing" placeholder immediately for UX feedback
  let scheme;
  try {
    scheme = await Scheme.findOneAndUpdate(
      { userId: req.user._id, classCode, subject, term: Number(term) },
      { status: 'parsing', originalFileName: req.file.originalname, sourceType: 'file', weeklyBreakdown: [] },
      { upsert: true, new: true }
    );

    // Extract text
    let rawText = '';
    const mime = req.file.mimetype;
    const fname = req.file.originalname.toLowerCase();

    if (mime === 'application/pdf' || fname.endsWith('.pdf')) {
      if (!pdfParse) {
        await Scheme.findByIdAndUpdate(scheme._id, { status: 'error', errorMessage: 'PDF parsing unavailable. Please use DOCX or paste text.' });
        return res.status(400).json({ success: false, message: 'PDF parsing is currently unavailable. Upload a DOCX or paste text instead.' });
      }
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text;
    } else if (fname.endsWith('.docx')) {
      if (!mammoth) {
        await Scheme.findByIdAndUpdate(scheme._id, { status: 'error', errorMessage: 'DOCX parsing unavailable. Please paste text.' });
        return res.status(400).json({ success: false, message: 'DOCX parsing is currently unavailable. Paste the text instead.' });
      }
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = docxData.value;
    } else if (fname.endsWith('.txt') || mime === 'text/plain') {
      rawText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Use PDF, DOCX, or TXT.' });
    }

    if (!rawText.trim()) throw new Error('No readable text found in document.');

    const weeklyBreakdown = await parseSchemeText(rawText, classCode, subject, Number(term));

    const updated = await Scheme.findByIdAndUpdate(scheme._id, {
      rawText,
      weeklyBreakdown,
      totalWeeks: weeklyBreakdown.length,
      status: 'ready',
      parsedAt: new Date(),
    }, { new: true });

    res.json({ success: true, scheme: updated });
  } catch (err) {
    console.error('Scheme upload error:', err);
    if (scheme) await Scheme.findByIdAndUpdate(scheme._id, { status: 'error', errorMessage: err.message });
    res.status(500).json({ success: false, message: err.message || 'Failed to process scheme document.' });
  }
});

// ── POST /api/scheme/camera ─────────────────────────────────────────────────
// Process a photo of a scheme using Gemini Vision
router.post('/camera', protect, upload.single('image'), async (req, res) => {
  const { classCode, subject, term } = req.body;
  if (!req.file || !classCode || !subject || !term) {
    return res.status(400).json({ success: false, message: 'Missing image or required parameters.' });
  }

  let scheme;
  try {
    scheme = await Scheme.findOneAndUpdate(
      { userId: req.user._id, classCode, subject, term: Number(term) },
      { status: 'parsing', sourceType: 'camera', weeklyBreakdown: [] },
      { upsert: true, new: true }
    );

    const rawText = await extractTextFromImage(req.file.buffer, req.file.mimetype);
    if (!rawText.trim()) throw new Error('Could not extract any text from image.');

    const weeklyBreakdown = await parseSchemeText(rawText, classCode, subject, Number(term));

    const updated = await Scheme.findByIdAndUpdate(scheme._id, {
      rawText,
      weeklyBreakdown,
      totalWeeks: weeklyBreakdown.length,
      status: 'ready',
      parsedAt: new Date(),
    }, { new: true });

    res.json({ success: true, scheme: updated });
  } catch (err) {
    console.error('Scheme camera OCR error:', err);
    if (scheme) await Scheme.findByIdAndUpdate(scheme._id, { status: 'error', errorMessage: err.message });
    res.status(500).json({ success: false, message: err.message || 'Vision OCR failed.' });
  }
});

// ── GET /api/scheme/list ────────────────────────────────────────────────────
router.get('/list', protect, async (req, res) => {
  try {
    const schemes = await Scheme.find({ userId: req.user._id })
      .select('-rawText') // exclude large raw text
      .sort({ createdAt: -1 });
    res.json({ success: true, schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list schemes.' });
  }
});

// ── GET /api/scheme/weekly ──────────────────────────────────────────────────
router.get('/weekly', protect, async (req, res) => {
  const { classCode, subject, term } = req.query;
  try {
    const scheme = await Scheme.findOne({ userId: req.user._id, classCode, subject, term: Number(term) });
    if (!scheme) return res.status(404).json({ success: false, message: 'No scheme found. Please upload one first.' });
    res.json({ success: true, scheme: { ...scheme.toObject(), rawText: undefined }, weeklyBreakdown: scheme.weeklyBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving scheme.' });
  }
});

// ── GET /api/scheme/:id ─────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ _id: req.params.id, userId: req.user._id }).select('-rawText');
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });
    res.json({ success: true, scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving scheme.' });
  }
});

// ── DELETE /api/scheme/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Scheme.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Scheme deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete scheme.' });
  }
});

// ── POST /api/scheme/generate-range ─────────────────────────────────────────
// Generate lesson notes for a range of weeks using the uploaded scheme as source
router.post('/generate-range', protect, async (req, res) => {
  const { schemeId, weekFrom, weekTo, classCode, subject, term, style, teachingDays, periods } = req.body;
  if (!schemeId || !weekFrom || !weekTo) {
    return res.status(400).json({ success: false, message: 'schemeId, weekFrom, and weekTo are required.' });
  }
  try {
    const scheme = await Scheme.findOne({ _id: schemeId, userId: req.user._id });
    if (!scheme || scheme.status !== 'ready') {
      return res.status(404).json({ success: false, message: 'Scheme not found or not ready.' });
    }

    const from = Number(weekFrom);
    const to   = Number(weekTo);
    const weeks = scheme.weeklyBreakdown.filter(w => w.week >= from && w.week <= to);
    if (!weeks.length) return res.status(400).json({ success: false, message: `No weeks found between ${from} and ${to} in this scheme.` });

    const savedLessons = [];
    // Sequential loop is MANDATORY for Sequence Awareness (Week 2 needs Week 1 in DB)
    for (const weekData of weeks) {
      const { lesson, isJHS } = await generateLessonFromScheme({
        userId: req.user._id,
        classCode: classCode || scheme.classCode,
        subject: subject || scheme.subject,
        term: term || scheme.term,
        week: weekData.week,
        style: style || 'Standard',
        level: req.body.level || 'Standard',
        teachingDays: teachingDays || null,
        periods: periods || null,
      }, weekData);

      const saved = await Lesson.create({
        userId: req.user._id,
        classCode: classCode || scheme.classCode,
        className: CLASS_LABEL[classCode || scheme.classCode] || classCode || scheme.classCode,
        subject: subject || scheme.subject,
        term: Number(term || scheme.term),
        week: weekData.week,
        style: style || 'Standard',
        schemeId: scheme._id,
        weekEnding: lesson.weekEnding,
        strand: weekData.strand || lesson.strand,
        subStrand: weekData.subStrand || lesson.subStrand,
        contentStandard: weekData.contentStandard || lesson.contentStandard,
        indicator: weekData.indicator || lesson.indicator,
        performanceIndicator: lesson.performanceIndicator,
        teachingResources: lesson.teachingResources,
        coreCompetencies: lesson.coreCompetencies,
        reference: lesson.reference,
        duration: lesson.duration,
        classSize: lesson.classSize,
        keywords: weekData.keyWords || lesson.keywords,
        days: lesson.days || [{ day: lesson.day || 'Thursday', phase1: lesson.phase1, phase2: lesson.phase2, phase3: lesson.phase3 }],
        isValid: true,
      });
      savedLessons.push(saved);
    }

    res.json({ success: true, lessons: savedLessons, count: savedLessons.length });
  } catch (err) {
    console.error('Scheme generate-range error:', err);
    res.status(500).json({ success: false, message: err.message || 'Generation failed.' });
  }
});

module.exports = router;
