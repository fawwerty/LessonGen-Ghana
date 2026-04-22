const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const promote = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'sys_admin' },
      { new: true }
    );
    if (user) {
      console.log(`✅ User ${email} promoted to sys_admin.`);
    } else {
      console.log(`❌ User ${email} not found.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('🔥 Promotion failed:', err.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promoteUser.js <email>');
  process.exit(1);
}

promote(email);
