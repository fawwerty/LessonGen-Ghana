const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  school: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'school_admin', 'sys_admin'], default: 'teacher' },
  plan: { type: String, enum: ['free', 'monthly', 'annual'], default: 'free' },
  exportCount: { type: Number, default: 0 },
  freeExportUsed: { type: Boolean, default: false },
  freeGenerationUsed: { type: Boolean, default: false },
  paymentRef: { type: String },
  paymentExpiry: { type: Date },
  subjects: [String],
  classes: [String],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.canExport = function() {
  if (this.plan !== 'free') return true;
  if (!this.freeExportUsed) return true;
  return false;
};

userSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
