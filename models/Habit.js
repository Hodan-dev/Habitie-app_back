const mongoose = require('mongoose');

// Schema-ka Habit-ka
const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User-ka waa lagama maarmaan']
  },
  name: {
    type: String,
    required: [true, 'Magaca habit-ka waa lagama maarmaan'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetValue: {
    type: Number,
    default: 0
  },
  targetUnit: {
    type: String,
    default: ''
  },
  daysToContinue: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  value: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index-ka loo sameeyay si loo helo habit-ka user-ka iyo taariikhda
habitSchema.index({ user: 1, date: -1, name: 1 });

module.exports = mongoose.model('Habit', habitSchema);
