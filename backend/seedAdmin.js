const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lessongen');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@lessongen.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: 'admin123', // Will be hashed by pre-save hook
      school: 'LessonGen Global',
      role: 'sys_admin',
      plan: 'annual'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@lessongen.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
