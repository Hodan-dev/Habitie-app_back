const mongoose = require('mongoose');

// Schema-ka Meal-ka
const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User-ka waa lagama maarmaan']
  },
  name: {
    type: String,
    required: [true, 'Magaca cuntada waa lagama maarmaan'],
    trim: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    required: [true, 'Nooca cuntada waa lagama maarmaan']
  },
  calories: {
    type: Number,
    required: [true, 'Calorie-ka waa lagama maarmaan'],
    min: [0, 'Calorie-ka ma noqon karo tiro taban']
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index-ka loo sameeyay si loo helo cuntada user-ka iyo taariikhda
mealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);
