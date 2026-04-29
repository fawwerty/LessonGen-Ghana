const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    // In production, we should probably crash or use a very long random string if we must
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('school').trim().notEmpty().withMessage('School is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      school: req.body.school,
      password: req.body.password,
      role: req.body.role || 'teacher'
    });

    res.status(201).json({
      success: true,
      token: signToken(user._id),
      user: user.toSafeJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    const user = await User.findOne({ email: req.body.email });
    console.log('👤 User found:', !!user);
    const passwordMatches = user ? await user.comparePassword(req.body.password) : false;
    console.log('🔑 Password match:', passwordMatches);
    if (!user || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({ success: true, token: signToken(user._id), user: user.toSafeJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

module.exports = router;
