const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');

const buildStats = (exams, submissions) => {
    const statsByExam = submissions.reduce((acc, sub) => {
        const key = sub.examId.toString();
        if (!acc[key]) acc[key] = { scores: [], students: new Set() };
        acc[key].scores.push(sub.percentage);
        acc[key].students.add(sub.userId.toString());
        return acc;
    }, {});

    return exams.map((exam) => {
        const stats = statsByExam[exam._id.toString()];
        const studentCount = stats ? stats.students.size : 0;
        const averageScore = stats && stats.scores.length
            ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
            : null;
        return {
            ...exam.toObject(),
            studentCount,
            averageScore
        };
    });
};

/**
 * @desc    Get exams created or joined by user
 * @route   GET /api/user/my-exams
 * @access  Private
 */
exports.getMyExams = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const user = await User.findById(userId).lean();
        const joinedIds = user?.joinedExams || [];

        const createdExams = await Exam.find({ createdBy: new mongoose.Types.ObjectId(userId) });
        const joinedExams = joinedIds.length > 0
            ? await Exam.find({ _id: { $in: joinedIds } })
            : [];

        const mergedMap = new Map();
        [...createdExams, ...joinedExams].forEach((exam) => {
            mergedMap.set(exam._id.toString(), exam);
        });

        const merged = Array.from(mergedMap.values());
        const examIds = merged.map((e) => e._id);
        const submissions = await Submission.find({ examId: { $in: examIds } });

        const data = buildStats(merged, submissions);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
