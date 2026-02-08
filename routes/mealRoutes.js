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

// hel dhamaan meals
router.get('/', getMeals);

// hel meal gaar ah by ID
router.get('/:id', getMeal);

// Abuur meal cusub
router.post('/', createMeal);

// Cusboonaysii meal
router.put('/:id', updateMeal);

// Tirtir meal
router.delete('/:id', deleteMeal);

module.exports = router;
