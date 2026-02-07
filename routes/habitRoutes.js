const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

// Dhammaan routes-ka waa inay yihiin protected
router.use(protect);

// Get all habits
router.get('/', getHabits);

// Get single habit
router.get('/:id', getHabit);

// Create habit
router.post('/', createHabit);

// Update habit
router.put('/:id', updateHabit);

// Toggle habit completion
router.patch('/:id/toggle', toggleHabit);

// Delete habit
router.delete('/:id', deleteHabit);

module.exports = router;
