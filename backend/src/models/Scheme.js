const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classCode: { type: String, required: true },
  subject: { type: String, required: true },
  term: { type: Number, required: true },
  originalFileName: String,
  rawText: String,
  weeklyBreakdown: [{
    week: Number,
    strand: String,
    subStrand: String,
    contentStandard: String,
    indicator: String,
    topics: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

schemeSchema.index({ userId: 1, classCode: 1, subject: 1, term: 1 });

module.exports = mongoose.model('Scheme', schemeSchema);
