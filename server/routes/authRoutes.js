const express = require('express');
const passport = require('passport');
const { googleCallback, getCurrentUser, logout } = require('../controllers/authController');
const { CLIENT_URL } = require('../config/keys');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Authenticate with Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google auth callback
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: CLIENT_URL || '/' }),
    googleCallback
);

/**
 * @route   GET /api/auth/current-user
 * @desc    Get current user
 */
router.get('/current-user', protect, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
router.post('/logout', protect, logout);

module.exports = router;
