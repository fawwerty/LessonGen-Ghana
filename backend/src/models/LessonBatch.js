const mongoose = require('mongoose');

const lessonBatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // E.g., "Term 1 Week 1 Notes Batch"
  term: { type: Number, required: true },
  week: { type: Number, required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LessonBatch', lessonBatchSchema);
