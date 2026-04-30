const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const Registration = require('../models/Registration');
const generateAccessCode = require('../utils/generateAccessCode');
const { getStudentExamStatus, answerLetterToIndex, answerIndexToLetter, normalizeOptions } = require('../utils/helpers');

const normalizeEmails = (emails = []) => {
    if (!Array.isArray(emails)) return [];
    return emails.map((e) => String(e).toLowerCase().trim()).filter(Boolean);
};

const getUserId = (req) => req.userId || req.user?._id || req.user?.id;

/**
 * @desc    Create new exam
 * @route   POST /api/exams
 * @access  Private
 */
// Removed duplicate getUserId

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
        const { title, description, startDate, endDate, authorizedEmails, accessCode, registrationClosingDate } = req.body;

        // Basic validation in controller for faster feedback
        if (!title || !description || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Title, Description, Start Date, and End Date are required' });
        }

        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        // Generate unique access code if not provided
        let accessCodeValue = accessCode && String(accessCode).trim()
            ? String(accessCode).trim().toUpperCase()
            : await generateUniqueAccessCode();

        if (!accessCodeValue) {
            return res.status(500).json({ success: false, message: 'Failed to generate unique access code' });
        }

        // Create the exam instance
        const exam = new Exam({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            authorizedEmails: normalizeEmails(authorizedEmails),
            createdBy: userId,
            accessCode: accessCodeValue,
            registrationClosingDate: registrationClosingDate ? new Date(registrationClosingDate) : new Date(startDate),
            status: 'draft' // Always start as draft
        });

        // Trigger pre-validate/pre-save
        await exam.save();

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: exam
        });
    } catch (err) {
        console.error('[CREATE EXAM ERROR]', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.keys(err.errors).map(key => ({ field: key, message: err.errors[key].message }))
            });
        }
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

        // 2. Get registered exams
        const registrations = await Registration.find({ 
            $or: [
                { userId: new mongoose.Types.ObjectId(userId) },
                { email: req.user.email.toLowerCase() }
            ]
        });
        const registeredExamIds = registrations.map(r => r.examId.toString());

        // 3. Get invited exams
        const userEmail = req.user.email.toLowerCase();
        const invitedExams = await Exam.find({
            status: 'published',
            authorizedEmails: userEmail
        });
        const invitedExamIds = invitedExams.map(e => e._id.toString());

        // 4. Combine all unique exam IDs
        const joinedExamIds = user.joinedExams.map(e => e._id.toString());
        const allExamIds = [...new Set([...joinedExamIds, ...registeredExamIds, ...invitedExamIds])];

        // 5. Fetch all these exams
        const allExams = await Exam.find({ _id: { $in: allExamIds } });

        // 6. Get submissions for this user
        const submissions = await Submission.find({
            userId: new mongoose.Types.ObjectId(userId)
        });

        // 🔥 map exams with status
        const examsWithStatus = allExams.map((exam) => {

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

        const allowed = ['title', 'description', 'startDate', 'endDate', 'timeLimitMinutes', 'authorizedEmails', 'accessCode', 'registrationClosingDate', 'resultPublished'];
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

        Object.assign(exam, updates);
        await exam.save();

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
 * @desc    Get all published exams (Public)
 * @route   GET /api/exams/public
 * @access  Public
 */
exports.getPublishedExams = async (req, res) => {
    try {
        const exams = await Exam.find({ status: 'published' }).sort({ startDate: 1 });
        res.status(200).json({ success: true, data: exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Register for an exam
 * @route   POST /api/exams/:id/register
 * @access  Public
 */
exports.registerForExam = async (req, res) => {
    try {
        const { fullName, mobileNumber, dob, location, email, qualification } = req.body;
        const examId = req.params.id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const closingDate = exam.registrationClosingDate || exam.startDate;

        console.log("NOW:", new Date());
        console.log("CLOSING DATE:", new Date(closingDate));

        if (new Date().getTime() >= new Date(closingDate).getTime()) {
            return res.status(400).json({ success: false, message: 'Registration for this exam has closed' });
        }

        const registration = await Registration.create({
            examId,
            fullName,
            mobileNumber,
            dob,
            location,
            email: email.toLowerCase(),
            qualification,
            userId: req.user ? (req.user.id || req.user._id) : null
        });

        res.status(201).json({ success: true, data: registration });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already registered for this exam' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Start an exam attempt
 * @route   POST /api/exams/:id/start
 * @access  Private
 */
exports.startExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = getUserId(req);

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (exam.status !== 'published') {
            return res.status(400).json({ success: false, message: 'Exam is not published yet' });
        }

        // Check registration
        const registration = await Registration.findOne({
            examId,
            $or: [
                { userId },
                { email: req.user.email.toLowerCase() }
            ]
        });

        if (!registration) {
            return res.status(403).json({ success: false, message: 'Only registered users can attend this exam' });
        }

        // Check time window
        const now = new Date();
        const start = new Date(exam.startDate);
        const end = new Date(exam.endDate);

        if (now < start) {
            return res.status(400).json({ success: false, message: 'Exam has not started yet' });
        }
        if (now > end) {
            return res.status(400).json({ success: false, message: 'Exam has already ended' });
        }

        // Check for existing submission/attempt
        let submission = await Submission.findOne({ examId, userId });
        if (submission && submission.status === 'submitted') {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
        }

        if (!submission) {
            // Create new ongoing attempt
            submission = await Submission.create({
                examId,
                userId,
                status: 'ongoing',
                startTime: new Date(),
                totalQuestions: exam.questions.length,
                answers: []
            });
        }

        res.status(200).json({
            success: true,
            data: {
                submissionId: submission._id,
                startTime: submission.startTime,
                timeLimitMinutes: exam.timeLimitMinutes
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Check registration for an exam
 * @route   GET /api/exams/:id/registration-check
 * @access  Private
 */
exports.checkRegistration = async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const userEmail = req.user ? req.user.email.toLowerCase() : null;

        if (!userId && !userEmail) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findOne({
            examId,
            $or: [
                { userId },
                { email: userEmail }
            ]
        });

        res.status(200).json({
            success: true,
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Publish results for an exam
 * @route   POST /api/exams/:id/publish-results
 * @access  Private (Creator only)
 */
exports.publishResults = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const userId = req.userId || req.user?._id;
        if (exam.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        exam.resultPublished = true;
        await exam.save();

        res.status(200).json({ success: true, message: 'Results published successfully' });
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
