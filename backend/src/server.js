require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const exportRoutes = require('./routes/exports');
const paymentRoutes = require('./routes/payments');
const curriculumRoutes = require('./routes/curriculum');
const adminRoutes = require('./routes/admin');
const schemeRoutes = require('./routes/scheme');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:8081'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, try again later.' });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: 'AI generation limit reached. Wait 1 minute.' });
app.use('/api/', apiLimiter);
app.use('/api/lessons/generate', aiLimiter);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lessongen')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scheme', schemeRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'LessonGen Ghana API', version: '1.0.0' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 LessonGen API running on port ${PORT}`));

module.exports = app;
