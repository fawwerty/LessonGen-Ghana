const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  day: String,
  phase1: String,
  phase2: String,
  phase3: String
});

const lessonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classCode: { type: String, required: true },
  className: String,
  subject: { type: String, required: true },
  term: { type: Number, required: true },
  week: { type: Number, required: true },
  weekEnding: String,
  style: { type: String, default: 'Standard' },
  strand: String,
  subStrand: String,
  contentStandard: String,
  indicator: String,
  performanceIndicator: String,
  teachingResources: String,
  coreCompetencies: String,
  reference: String,
  duration: String,
  classSize: String,
  keywords: String,
  days: [daySchema],
  isValid: { type: Boolean, default: true },
  exportCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

lessonSchema.index({ userId: 1, createdAt: -1 });
lessonSchema.index({ classCode: 1, subject: 1, term: 1, week: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
