const mongoose = require('mongoose');

const weekBreakdownSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  strand: String,
  subStrand: String,
  contentStandard: String,
  indicator: String,
  performanceIndicator: String,
  topics: [String],
  keyWords: [String],
}, { _id: false });

const schemeSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classCode:    { type: String, required: true },
  subject:      { type: String, required: true },
  term:         { type: Number, required: true },
  // Source
  originalFileName: String,
  rawText:      String,
  sourceType:   { type: String, enum: ['file', 'paste', 'manual'], default: 'file' },
  // Parsing state
  status:       { type: String, enum: ['parsing', 'ready', 'error'], default: 'parsing' },
  totalWeeks:   { type: Number, default: 0 },
  parsedAt:     Date,
  errorMessage: String,
  // Structured data
  weeklyBreakdown: [weekBreakdownSchema],
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
});

schemeSchema.index({ userId: 1, classCode: 1, subject: 1, term: 1 });
schemeSchema.index({ userId: 1, createdAt: -1 });

schemeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Scheme', schemeSchema);
