const { CLIENT_URL } = require('../config/keys');

/**
 * @desc    Google OAuth Callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = (req, res) => {
    res.redirect(`${CLIENT_URL}/dashboard`);
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/current-user
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        res.status(200).json({ success: true, data: req.user });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    });
};
