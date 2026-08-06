const mongoose = require('mongoose');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Registration = require('../models/Registration');
const { isExamActive, normalizeOptions, optionsToArray, answerIndexToLetter, answerLetterToIndex } = require('../utils/helpers');

/**
 * @desc    Add question to exam
 * @route   POST /api/questions
 * @access  Private (Creator only)
 */
exports.addQuestion = async (req, res) => {
    try {
        const { examId, questionText, options, correctAnswer, order, points } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to add questions' });
        }

        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot add questions to a published exam' });
        }

        if (correctAnswer === undefined || correctAnswer === null) {
            return res.status(400).json({ success: false, message: 'Correct answer is required' });
        }

        const normalizedOptions = normalizeOptions(options);
        const optionValues = [normalizedOptions.A, normalizedOptions.B, normalizedOptions.C, normalizedOptions.D];
        if (optionValues.some((v) => !String(v || '').trim())) {
            return res.status(400).json({ success: false, message: 'All four options are required' });
        }
        const correctIndex = answerLetterToIndex(correctAnswer);
        if (correctIndex < 0 || correctIndex > 3) {
            return res.status(400).json({ success: false, message: 'Correct answer must be A-D or 0-3' });
        }
        const correct = answerIndexToLetter(correctIndex);

        const question = await Question.create({
            examId,
            questionText,
            options: normalizedOptions,
            correctAnswer: correct,
            order,
            points
        });

        await Exam.findByIdAndUpdate(examId, { $addToSet: { questions: question._id } });

        res.status(201).json({ success: true, data: question });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all questions for an exam
 * @route   GET /api/questions/exam/:examId
 * @access  Private
 */
exports.getQuestionsByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        console.log(`[DEBUG] Fetching questions for examId: ${examId}`);

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            console.error(`[DEBUG] Invalid examId received: ${examId}`);
            return res.status(400).json({ success: false, message: 'Invalid exam ID format' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.error(`[DEBUG] Exam not found in DB: ${examId}`);
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const isCreator = exam.createdBy.toString() === req.user.id;

        if (!isCreator) {
            if (exam.status !== 'published') {
                return res.status(403).json({ success: false, message: 'Exam is not published yet' });
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
                return res.status(403).json({ success: false, message: 'You must register for this exam first' });
            }

            if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
                return res.status(403).json({ success: false, message: 'You are not authorized to take this exam' });
            }

            const existingSubmission = await Submission.findOne({ examId, userId: req.user.id });
            if (existingSubmission && existingSubmission.status === 'submitted') {
                return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
            }

            // More detailed check for isExamActive
            const now = new Date();
            const start = new Date(exam.startDate);
            const end = new Date(start.getTime() + (exam.timeLimitMinutes || 0) * 60000);

            if (now < start) {
                return res.status(400).json({ success: false, message: `Exam has not started yet. It starts at ${start.toLocaleString()}` });
            }
            if (now > end) {
                return res.status(400).json({ success: false, message: `Exam ended at ${end.toLocaleString()}` });
            }
        }

        let questions = await Question.find({ examId }).sort('order');
        if (!isCreator) {
            questions = questions.sort(() => Math.random() - 0.5);
            questions = questions.map((q) => ({
                _id: q._id,
                examId: q.examId,
                questionText: q.questionText,
                options: optionsToArray(q.options),
                points: q.points,
                order: q.order
            }));
        } else {
            questions = questions.map((q) => ({
                ...q.toObject(),
                options: normalizeOptions(q.options)
            }));
        }

        console.log(`[DEBUG] Successfully fetched ${questions.length} questions for exam ${examId}`);
        res.status(200).json({ 
            success: true, 
            questions: questions, // Use 'questions' key as requested
            data: questions       // Keep 'data' for backward compatibility
        });
    } catch (err) {
        console.error(`[DEBUG] Error in getQuestionsByExam: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private (Creator only)
 */
exports.updateQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const exam = await Exam.findById(question.examId);
        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot edit questions of a published exam' });
        }

        const updates = { ...req.body };
        if (updates.options) {
            updates.options = normalizeOptions(updates.options);
            const optionValues = [updates.options.A, updates.options.B, updates.options.C, updates.options.D];
            if (optionValues.some((v) => !String(v || '').trim())) {
                return res.status(400).json({ success: false, message: 'All four options are required' });
            }
        }
        if (updates.correctAnswer !== undefined) {
            const correctIndex = answerLetterToIndex(updates.correctAnswer);
            if (correctIndex < 0 || correctIndex > 3) {
                return res.status(400).json({ success: false, message: 'Correct answer must be A-D or 0-3' });
            }
            updates.correctAnswer = answerIndexToLetter(correctIndex);
        }

        question = await Question.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: question });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private (Creator only)
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const exam = await Exam.findById(question.examId);
        if (exam.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot delete questions of a published exam' });
        }

        await Question.findByIdAndDelete(req.params.id);
        await Exam.findByIdAndUpdate(exam._id, { $pull: { questions: question._id } });
        res.status(200).json({ success: true, message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
