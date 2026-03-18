const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
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
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const isCreator = exam.createdBy.toString() === req.user.id;

        if (!isCreator) {
            if (exam.status !== 'published') {
                return res.status(403).json({ success: false, message: 'Exam is not published yet' });
            }
            if (exam.authorizedEmails.length > 0 && !exam.authorizedEmails.includes(req.user.email.toLowerCase())) {
                return res.status(403).json({ success: false, message: 'You are not authorized to take this exam' });
            }
            const existingSubmission = await Submission.findOne({ examId, userId: req.user.id });
            if (existingSubmission) {
                return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
            }
            if (!isExamActive(exam.startDate, exam.endDate)) {
                return res.status(400).json({ success: false, message: 'Exam is not active' });
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

        res.status(200).json({ success: true, data: questions });
    } catch (err) {
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
