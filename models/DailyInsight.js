const mongoose = require('mongoose');

// Daily insight model
const dailyInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  bmr: {
    type: Number,
    default: null,
  },
  dailyCalories: {
    type: Number,
    default: 0,
  },
  weeklyAverageCalories: {
    type: Number,
    default: 0,
  },
  calorieBalance: {
    type: Number,
    default: 0,
  },
  weightTendency: {
    type: String,
    enum: ['deficit', 'balanced', 'surplus', 'unknown'],
    default: 'unknown',
  },
  consistency: {
    type: String,
    enum: ['consistent', 'inconsistent', 'no_data'],
    default: 'no_data',
  },
  habitCompletionRate: {
    type: Number,
    default: 0,
  },
  streaks: {
    type: Array,
    default: [],
  },
  insights: {
    type: [String],
    default: [],
  },
  computedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

dailyInsightSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyInsight', dailyInsightSchema);
