const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');

// Admin routes (admin kaliya)
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
