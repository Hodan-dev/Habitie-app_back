const express = require('express');
const router = express.Router();
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal
} = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');

// Dhammaan routes-ka waa inay yihiin protected
router.use(protect);

// Get all meals
router.get('/', getMeals);

// Get single meal
router.get('/:id', getMeal);

// Create meal
router.post('/', createMeal);

// Update meal
router.put('/:id', updateMeal);

// Delete meal
router.delete('/:id', deleteMeal);

module.exports = router;
