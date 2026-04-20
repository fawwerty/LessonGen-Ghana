// routes/curriculum.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { getCurriculum } = require('../services/aiService');
const router = express.Router();
const fs = require('fs'), path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../shared/curriculum/nacca_db.json'), 'utf-8'));

router.get('/classes', protect, (req, res) => {
  res.json({ success: true, classes: Object.keys(db) });
});

router.get('/subjects/:classCode', protect, (req, res) => {
  const subjects = Object.keys(db[req.params.classCode] || {});
  res.json({ success: true, subjects });
});

router.get('/lookup', protect, (req, res) => {
  const { classCode, subject, term, week } = req.query;
  const curr = getCurriculum(classCode, subject, Number(term), Number(week));
  res.json({ success: true, curriculum: curr });
});

module.exports = router;
