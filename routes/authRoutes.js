const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  oauthSuccess
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');

// Register endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

// Get current user (protected)
router.get('/me', protect, getMe);

// Update profile (protected)
router.put('/profile', protect, updateProfile);

// OAuth endpoints
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth/fail' }),
  oauthSuccess
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth/fail' }),
  oauthSuccess
);

router.get('/oauth/fail', (req, res) => {
  res.status(401).json({ message: 'OAuth login failed' });
});

module.exports = router;
