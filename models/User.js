const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema-ka User-ka
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Magaca waa lagama maarmaan'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email-ka waa lagama maarmaan'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: [6, 'Password-ka waa inuu ka yaraan 6 xaraf'],
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  providerId: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  }
}, {
  timestamps: true // Wuxuu sii daaya createdAt iyo updatedAt
});

// Hash password-ka ka hor inta aan user-ka la kaydin
// Haddii password-ka aan la beddelin, ha hash garayn
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method-ka loo isticmaalo in la verify gareeyo password-ka
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
