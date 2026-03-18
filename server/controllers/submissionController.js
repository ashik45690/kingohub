const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const { calculatePercentage, calculateTimeTaken, isExamActive, answerLetterToIndex } = require('../utils/helpers');

/**
 * @desc    Submit exam answers
 * @route   POST /api/submissions
 * @access  Private
 */
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, startTime } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (exam.status !== 'published') {
            return res.status(400).json({ success: false, message: 'Exam is not published yet' });
        }

        if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'You are not authorized to take this exam' });
        }

        if (!isExamActive(exam.startDate, exam.endDate)) {
            return res.status(400).json({ success: false, message: 'Exam is not active' });
        }

        // Check if user already submitted
        const existingSubmission = await Submission.findOne({ examId, userId: req.user.id });
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
        }

        const questions = await Question.find({ examId });
        let score = 0;

        const processedAnswers = (answers || []).map((ans) => {
            const questionId = ans.questionId ? ans.questionId.toString() : '';
            const question = questions.find((q) => q._id.toString() === questionId);
            const correctIndex = question ? answerLetterToIndex(question.correctAnswer) : -1;
            const selectedIndex = answerLetterToIndex(ans.selectedAnswer);
            const isCorrect = question ? correctIndex === selectedIndex : false;
            if (isCorrect) score += 1;
            return {
                questionId: questionId,
                selectedAnswer: selectedIndex
            };
        });

        const totalQuestions = questions.length;
        const percentage = calculatePercentage(score, totalQuestions);
        const submitTime = new Date();
        let timeTaken = startTime ? calculateTimeTaken(startTime, submitTime) : 0;
        const maxSeconds = (exam.timeLimitMinutes || 0) * 60;
        if (maxSeconds > 0 && timeTaken > maxSeconds) {
            timeTaken = maxSeconds;
        }

        const submission = await Submission.create({
            examId,
            userId: req.user.id,
            answers: processedAnswers,
            score,
            totalQuestions,
            percentage,
            startTime,
            submitTime,
            timeTaken,
            status: req.body.status || 'submitted'
        });

        res.status(201).json({ success: true, data: submission });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all submissions for an exam (For Teacher)
 * @route   GET /api/submissions/exam/:examId
 * @access  Private (Creator only)
 */
exports.getExamSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ examId: req.params.examId }).populate('userId', 'name email');
        res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get specific user's submission for an exam
 * @route   GET /api/submissions/exam/:examId/user/:userId
 * @access  Private
 */
exports.getUserSubmission = async (req, res) => {
    try {
        const { examId, userId } = req.params;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (req.user.id !== userId && exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const submission = await Submission.findOne({ examId, userId }).populate('examId');
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        const payload = {
            _id: submission._id,
            examId: submission.examId,
            userId: submission.userId,
            score: submission.score,
            percentage: submission.percentage,
            totalQuestions: submission.totalQuestions,
            timeTaken: submission.timeTaken,
            startTime: submission.startTime,
            submitTime: submission.submitTime,
            status: submission.status
        };

        res.status(200).json({ success: true, data: payload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
