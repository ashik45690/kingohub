const Exam = require('../models/Exam');
const User = require('../models/User');

/**
 * @desc    Join an exam
 * @route   POST /api/exam/join
 * @access  Private
 */
exports.joinExam = async (req, res) => {
    try {
        const { examId } = req.body;
        if (!examId) {
            return res.status(400).json({ success: false, message: 'examId is required' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (exam.status !== 'published') {
            return res.status(400).json({ success: false, message: 'Exam is not published yet' });
        }

        if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'You are not authorized to join this exam' });
        }

        await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { joinedExams: examId } },
            { new: true }
        );

        res.status(200).json({ success: true, data: exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
