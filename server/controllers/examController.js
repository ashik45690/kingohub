const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const generateAccessCode = require('../utils/generateAccessCode');
const { getStudentExamStatus, answerLetterToIndex, answerIndexToLetter, normalizeOptions } = require('../utils/helpers');

const normalizeEmails = (emails = []) => {
    if (!Array.isArray(emails)) return [];
    return emails.map((e) => String(e).toLowerCase().trim()).filter(Boolean);
};

/**
 * @desc    Create new exam
 * @route   POST /api/exams
 * @access  Private
 */
const getUserId = (req) => req.userId || req.user?._id || req.user?.id;

const generateUniqueAccessCode = async () => {
    let code = generateAccessCode(6);
    // Ensure uniqueness
    let exists = await Exam.findOne({ accessCode: code });
    let guard = 0;
    while (exists && guard < 5) {
        code = generateAccessCode(6);
        exists = await Exam.findOne({ accessCode: code });
        guard += 1;
    }
    if (exists) {
        return null;
    }
    return code;
};

exports.createExam = async (req, res) => {
    try {
        const { title, description, startDate, endDate, timeLimitMinutes, authorizedEmails, accessCode } = req.body;

        if (!title || !description || !startDate || !endDate || !timeLimitMinutes) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        const userId = getUserId(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        let accessCodeValue = accessCode && String(accessCode).trim()
            ? String(accessCode).trim().toUpperCase()
            : await generateUniqueAccessCode();

        if (!accessCodeValue) {
            return res.status(500).json({ success: false, message: 'Failed to generate unique access code' });
        }

        if (accessCode && String(accessCode).trim()) {
            const existing = await Exam.findOne({ accessCode: accessCodeValue });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Access code already in use' });
            }
        }

        const exam = await Exam.create({
            title,
            description,
            startDate,
            endDate,
            timeLimitMinutes,
            authorizedEmails: normalizeEmails(authorizedEmails),
            createdBy: new mongoose.Types.ObjectId(userId),
            accessCode: accessCodeValue
        });

        res.status(201).json({
            success: true,
            data: exam
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get exams created by current user
 * @route   GET /api/exams/my-exams
 * @access  Private
 */
exports.getMyExams = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // ✅ Get exams created by user
        const exams = await Exam.find({
            createdBy: new mongoose.Types.ObjectId(userId)
        }).sort({ createdAt: -1 });

        const examIds = exams.map(e => e._id);

        // ✅ Get submissions
        const submissions = await Submission.find({
            examId: { $in: examIds }
        });

        // ✅ Calculate stats
        const statsByExam = {};

        submissions.forEach(sub => {
            const key = sub.examId.toString();

            if (!statsByExam[key]) {
                statsByExam[key] = {
                    scores: [],
                    students: new Set()
                };
            }

            statsByExam[key].scores.push(sub.percentage);
            statsByExam[key].students.add(sub.userId.toString());
        });

        // ✅ Final data
        const data = exams.map(exam => {
            const stats = statsByExam[exam._id.toString()];

            const studentCount = stats ? stats.students.size : 0;

            const averageScore =
                stats && stats.scores.length
                    ? Math.round(
                          stats.scores.reduce((a, b) => a + b, 0) /
                          stats.scores.length
                      )
                    : null;

            return {
                ...exam.toObject(),
                studentCount,
                averageScore
            };
        });

        return res.status(200).json({
            success: true,
            data   // ✅ IMPORTANT
        });

    } catch (err) {
        console.error("getMyExams error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get exams user has enrolled in/submitted
 * @route   GET /api/exams/enrolled
 * @access  Private
 */
exports.getEnrolledExams = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // 🔥 get user + exams
        const user = await User.findById(userId).populate('joinedExams');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 🔥 get submissions for this user
        const submissions = await Submission.find({
            userId: new mongoose.Types.ObjectId(userId)
        });

        // 🔥 map exams with status
        const examsWithStatus = user.joinedExams.map((exam) => {

            const submission = submissions.find(
                (s) => s.examId.toString() === exam._id.toString()
            );

            const hasSubmitted = !!submission;

            // ✅ use your helper
            const status = getStudentExamStatus(
                exam.startDate,
                exam.endDate,
                hasSubmitted
            );

            return {
                ...exam.toObject(),

                // 🔥 IMPORTANT
                status, // upcoming / ongoing / completed

                // 🔥 optional (useful for UI)
                score: submission ? submission.percentage : null,
                hasSubmitted
            };
        });

        res.status(200).json({
            success: true,
            data: examsWithStatus
        });

    } catch (err) {
        console.log('getEnrolledExams error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Search exam by access code
 * @route   GET /api/exams/search/:code
 * @access  Private
 */
exports.getExamByCode = async (req, res) => {
    try {
        const exam = await Exam.findOne({ accessCode: req.params.code.toUpperCase() });

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (exam.status !== 'published') {
            return res.status(400).json({ success: false, message: 'Exam is not published yet' });
        }

        if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'You are not authorized to take this exam' });
        }

        const userId = getUserId(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const existingSubmission = await Submission.findOne({ examId: exam._id, userId: new mongoose.Types.ObjectId(userId) });
        const status = getStudentExamStatus(exam.startDate, exam.endDate, !!existingSubmission);
        res.status(200).json({ success: true, data: { ...exam.toObject(), status } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get exam by ID
 * @route   GET /api/exams/:id
 * @access  Private
 */
exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const userId = getUserId(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const isCreator = exam.createdBy.toString() === userId.toString();

        if (!isCreator) {
            if (exam.status !== 'published') {
                return res.status(400).json({ success: false, message: 'Exam is not published yet' });
            }
            if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
                return res.status(403).json({ success: false, message: 'You are not authorized to take this exam' });
            }
        }

        res.status(200).json({ success: true, data: exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Update exam
 * @route   PUT /api/exams/:id
 * @access  Private (Creator only)
 */
exports.updateExam = async (req, res) => {
    try {
        let exam = await Exam.findById(req.params.id);

        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const userId = getUserId(req);
        if (!userId || exam.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to edit this exam' });
        }

        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot edit a published exam' });
        }

        const allowed = ['title', 'description', 'startDate', 'endDate', 'timeLimitMinutes', 'authorizedEmails', 'accessCode'];
        const updates = {};
        allowed.forEach((key) => {
            if (req.body[key] !== undefined) {
                updates[key] = key === 'authorizedEmails'
                    ? normalizeEmails(req.body[key])
                    : req.body[key];
            }
        });

        const nextStart = updates.startDate ? new Date(updates.startDate) : new Date(exam.startDate);
        const nextEnd = updates.endDate ? new Date(updates.endDate) : new Date(exam.endDate);
        if (nextEnd <= nextStart) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        if (updates.accessCode) {
            updates.accessCode = String(updates.accessCode).trim().toUpperCase();
            const existing = await Exam.findOne({ accessCode: updates.accessCode, _id: { $ne: exam._id } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Access code already in use' });
            }
        }

        exam = await Exam.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (Array.isArray(req.body.questions)) {
            const incomingQuestions = req.body.questions;
            const existingQuestions = await Question.find({ examId: exam._id });
            const existingById = new Map(existingQuestions.map((q) => [q._id.toString(), q]));

            const orderedIds = [];
            for (let i = 0; i < incomingQuestions.length; i++) {
                const q = incomingQuestions[i] || {};
                const qId = q._id || q.id;
                const qIdString = qId ? qId.toString() : null;

                if (!q.questionText || !String(q.questionText).trim()) {
                    return res.status(400).json({ success: false, message: 'Question text is required' });
                }

                const normalizedOptions = normalizeOptions(q.options);
                const optionValues = [normalizedOptions.A, normalizedOptions.B, normalizedOptions.C, normalizedOptions.D];
                if (optionValues.some((v) => !String(v || '').trim())) {
                    return res.status(400).json({ success: false, message: 'All four options are required' });
                }

                const correctIndex = answerLetterToIndex(q.correctAnswer);
                if (correctIndex < 0 || correctIndex > 3) {
                    return res.status(400).json({ success: false, message: 'Correct answer must be A-D or 0-3' });
                }
                const correct = answerIndexToLetter(correctIndex);

                const payload = {
                    questionText: q.questionText,
                    options: normalizedOptions,
                    correctAnswer: correct,
                    points: q.points ?? 1,
                    order: q.order ?? i + 1
                };

                if (qIdString && existingById.has(qIdString)) {
                    const updatedQuestion = await Question.findByIdAndUpdate(qIdString, payload, { new: true, runValidators: true });
                    orderedIds.push(updatedQuestion._id);
                } else {
                    const createdQuestion = await Question.create({
                        examId: exam._id,
                        ...payload
                    });
                    orderedIds.push(createdQuestion._id);
                }
            }

            const orderedIdStrings = orderedIds.map((id) => id.toString());
            const toDeleteIds = existingQuestions
                .filter((q) => !orderedIdStrings.includes(q._id.toString()))
                .map((q) => q._id);

            if (toDeleteIds.length > 0) {
                await Question.deleteMany({ _id: { $in: toDeleteIds } });
            }

            await Exam.findByIdAndUpdate(exam._id, { questions: orderedIds });
        }

        res.status(200).json({ success: true, data: exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete exam
 * @route   DELETE /api/exams/:id
 * @access  Private (Creator only)
 */
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot delete a published exam' });
        }

        await Question.deleteMany({ examId: exam._id });
        await Submission.deleteMany({ examId: exam._id });
        await Exam.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Exam deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Publish exam
 * @route   POST /api/exams/:id/publish
 * @access  Private (Creator only)
 */
exports.publishExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Exam is already published' });
        }

        const questionsCount = await Question.countDocuments({ examId: req.params.id });
        if (questionsCount === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one question before publishing' });
        }

        const updated = await Exam.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get exam analytics
 * @route   GET /api/exams/:id/analytics
 * @access  Private (Creator only)
 */
exports.getExamAnalytics = async (req, res) => {
    try {
        const submissions = await Submission.find({ examId: req.params.id }).populate('userId', 'name email');
        const questions = await Question.find({ examId: req.params.id });

        if (submissions.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalStudents: 0,
                    averageScore: 0,
                    averagePercentage: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    students: [],
                    questionStats: questions.map((q, idx) => ({
                        question: `Q${idx + 1}`,
                        totalAttempts: 0,
                        correctAnswers: 0,
                        successRate: 0
                    }))
                }
            });
        }

        const scores = submissions.map((s) => s.score);
        const percentages = submissions.map((s) => s.percentage);
        const totalStudents = submissions.length;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);
        const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
        const averagePercentage = percentages.reduce((a, b) => a + b, 0) / totalStudents;

        const students = submissions.map((s) => ({
            name: s.userId?.name || 'Unknown',
            email: s.userId?.email || '',
            score: s.score,
            percentage: s.percentage,
            timeTaken: s.timeTaken || 0
        }));

        const questionStats = questions.map((q, idx) => {
            const total = submissions.length;
            const correctCount = submissions.reduce((acc, s) => {
                const ans = s.answers.find((a) => a.questionId.toString() === q._id.toString());
                if (!ans) return acc;
                const correctIndex = answerLetterToIndex(q.correctAnswer);
                return acc + (ans.selectedAnswer === correctIndex ? 1 : 0);
            }, 0);
            const successRate = total === 0 ? 0 : Math.round((correctCount / total) * 100);
            return {
                question: `Q${idx + 1}`,
                totalAttempts: total,
                correctAnswers: correctCount,
                successRate
            };
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                averageScore: Number(averageScore.toFixed(2)),
                averagePercentage: Number(averagePercentage.toFixed(2)),
                highestScore,
                lowestScore,
                students,
                questionStats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
