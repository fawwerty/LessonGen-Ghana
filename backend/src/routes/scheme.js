// routes/scheme.js
const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Scheme = require('../models/Scheme');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Optional modules, handled dynamically since npm was failing on this host
let pdfParse = null;
let mammoth = null;
try { pdfParse = require('pdf-parse'); } catch (e) {}
try { mammoth = require('mammoth'); } catch (e) {}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

router.post('/upload', protect, upload.single('schemeFile'), async (req, res) => {
  const { classCode, subject, term } = req.body;
  if (!req.file || !classCode || !subject || !term) {
    return res.status(400).json({ success: false, message: 'Missing file or required parameters.' });
  }

  try {
    let rawText = '';
    if (req.file.mimetype === 'application/pdf') {
      if (!pdfParse) return res.status(500).json({ success: false, message: 'PDF parsing is currently disabled due to missing dependencies.' });
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text;
    } else if (req.file.originalname.endsWith('.docx')) {
      if (!mammoth) return res.status(500).json({ success: false, message: 'DOCX parsing is currently disabled due to missing dependencies.' });
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = docxData.value;
    } else {
      return res.status(400).json({ success: false, message: 'Only PDF and DOCX files are supported.' });
    }

    if (!rawText.trim()) throw new Error("No readable text found in document.");

    const prompt = `You are an expert curriculum planner. Analyze the following Ghanaian Termly Scheme of Work (TSoW) for Class ${classCode}, Subject: ${subject}. 
The term is Term ${term}.
Break this document down into a week-by-week scheme (Week 1 through up to 15 weeks depending on what's in the document).
Extract the core details for each week exactly as defined in the document.

Output ONLY valid JSON in this exact structure:
[
  {
    "week": 1,
    "strand": "Name of strand",
    "subStrand": "Name of sub-strand",
    "contentStandard": "e.g. B4.1.1.1",
    "indicator": "e.g. B4.1.1.1.1",
    "topics": ["Main topic 1", "Sub-topic 2"]
  }
]

Document Text:
${rawText.substring(0, 25000)} // Truncating if extremely long
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const weeklyBreakdown = JSON.parse(text);

    const scheme = await Scheme.findOneAndUpdate(
      { userId: req.user._id, classCode, subject, term: Number(term) },
      { 
        originalFileName: req.file.originalname, 
        rawText, 
        weeklyBreakdown 
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, scheme });
  } catch (err) {
    console.error("Scheme parse error:", err);
    res.status(500).json({ success: false, message: 'Failed to process scheme document.' });
  }
});

router.get('/weekly', protect, async (req, res) => {
  const { classCode, subject, term } = req.query;
  try {
    const scheme = await Scheme.findOne({ userId: req.user._id, classCode, subject, term: Number(term) });
    if (!scheme) return res.status(404).json({ success: false, message: 'No scheme found. Please upload one first.' });
    res.json({ success: true, weeklyBreakdown: scheme.weeklyBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving scheme.' });
  }
});

module.exports = router;
