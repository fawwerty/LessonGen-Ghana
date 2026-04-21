// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });

    // ── Automatic Subscription Downgrade ──────────────────────────────────────────
    if (req.user.plan !== 'free' && req.user.paymentExpiry && new Date() > req.user.paymentExpiry) {
      console.log(`📉 Downgrading User ${req.user.email} (Subscription Expired)`);
      req.user.plan = 'free';
      await req.user.save();
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!['school_admin', 'sys_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, adminOnly };
