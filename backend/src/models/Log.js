const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['webhook', 'ai_cache_hit', 'ai_cache_miss', 'error', 'system'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['success', 'failure'],
    default: 'success'
  },
  message: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed }, // Raw request or response
  metadata: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    endpoint: { type: String },
    duration: { type: Number }, // in ms
    subject: { type: String },
    classCode: { type: String }
  }
}, { timestamps: true });

// Index for fast analytics
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ status: 1 });

module.exports = mongoose.model('Log', logSchema);
