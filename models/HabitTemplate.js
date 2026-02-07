const mongoose = require('mongoose');

// Schema-ka Habit Template
const habitTemplateSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

habitTemplateSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('HabitTemplate', habitTemplateSchema);