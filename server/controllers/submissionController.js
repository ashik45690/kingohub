const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Registration = require('../models/Registration');
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
        console.log(`[DEBUG] Received submission for examId: ${examId}`);
        console.log(`[DEBUG] Answers received count: ${answers?.length || 0}`);

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID format' });
        }

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, message: 'You must answer at least one question' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (exam.status !== 'published') {
            return res.status(400).json({ success: false, message: 'Exam is not published yet' });
        }

        // Check if user is registered
        const registration = await Registration.findOne({
            examId,
            $or: [
                { userId: req.user.id },
                { email: req.user.email.toLowerCase() }
            ]
        });

        if (!registration) {
            return res.status(403).json({ success: false, message: 'You must be registered to submit this exam' });
        }

        const now = new Date();
        const start = new Date(exam.startDate);
        const end = new Date(start.getTime() + (exam.timeLimitMinutes || 0) * 60000);

        if (now < start || now > end) {
            return res.status(400).json({ success: false, message: 'Submission is not allowed outside exam time window' });
        }

        // Check for existing 'submitted' submission
        const existingSubmission = await Submission.findOne({ examId, userId: req.user.id, status: 'submitted' });
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

        // Use findOneAndUpdate to handle ongoing attempt or create new one
        const submission = await Submission.findOneAndUpdate(
            { examId, userId: req.user.id },
            {
                answers: processedAnswers,
                score,
                totalQuestions,
                percentage,
                startTime: startTime || new Date(),
                submitTime,
                timeTaken,
                status: 'submitted' // Mark as submitted
            },
            { new: true, upsert: true }
        );

        console.log(`[DEBUG] Successfully processed submission for user ${req.user.id}. Score: ${score}/${totalQuestions}`);
        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        console.error(`[DEBUG] Submission error: ${err.message}`);
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
