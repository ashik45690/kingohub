const User = require('../models/User');
const Submission = require('../models/Submission');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({});
        const submissions = await Submission.find({});

        if (submissions.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalStudents,
                    average: 0,
                    highest: 0,
                    lowest: 0
                }
            });
        }

        const scores = submissions.map((r) => r.score);
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                average: Number(average.toFixed(2)),
                highest,
                lowest
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
