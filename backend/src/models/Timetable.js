const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday, Tuesday, Wednesday, Thursday, Friday
  subject: { type: String, required: true },
  startTime: String,
  endTime: String,
  periods: { type: Number, default: 1 }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classCode:    { type: String, required: true }, // The class this timetable is for
  
  // Structured data extracted from doc/image
  schedule: [timetableEntrySchema],
  
  // Metadata
  status:       { type: String, enum: ['parsing', 'ready', 'error'], default: 'parsing' },
  sourceType:   { type: String, enum: ['file', 'camera', 'manual'], default: 'file' },
  originalFileName: String,
  rawText:      String, // Raw text from OCR
  parsedAt:     Date,
  errorMessage: String,
  
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

timetableSchema.index({ userId: 1, classCode: 1 }, { unique: true });

timetableSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Timetable', timetableSchema);
