process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [Unhandled Rejection] at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔥 [Uncaught Exception]:', err);
});

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
const dashboardRoutes = require('./routes/dashboard');
const timetableRoutes = require('./routes/timetable');

const app = express();
// app.use(helmet()); // Temporarily disable for debugging network errors
app.set('trust proxy', 1);

// Global debug log for EVERY incoming request
app.use((req, res, next) => {
  console.log(`📡 [Incoming] ${req.method} ${req.url} (Origin: ${req.get('origin') || 'None'})`);
  next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['*']; // Default to all in development

app.use(cors({
  origin: true, // Allow all origins temporarily to force connection
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Manual OPTIONS handler for extra reliability
app.options('*', cors());

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
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', (req, res, next) => {
  console.log('🎯 [Match] Request hit the /api/dashboard mount point');
  next();
}, dashboardRoutes);

app.get('/api/health', (req, res) => {
  const routes = app._router.stack
    .filter(r => r.route || r.name === 'router')
    .map(r => {
      if (r.route) return `[ROUTE] ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`;
      if (r.name === 'router') return `[ROUTER] ${r.regexp.toString()}`;
      return null;
    })
    .filter(Boolean);

  res.json({ 
    status: 'ok', 
    version: '1.0.9-fresh-deps',
    timestamp: new Date().toISOString(),
    registeredRoutes: routes
  });
});
app.get('/api/ping', (req, res) => res.json({ success: true, message: 'Global API is alive' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 LessonGen API running on port ${PORT}`);
  
  // Debug: list all routes
  const routes = app._router.stack
    .filter(r => r.route || r.name === 'router')
    .map(r => {
      if (r.route) return `[ROUTE] ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`;
      if (r.name === 'router') return `[ROUTER] ${r.regexp.toString()}`;
      return null;
    })
    .filter(Boolean);
  console.log('📋 Registered Routes:\n', routes.join('\n'));
});

module.exports = app;
