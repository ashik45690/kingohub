const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true }
    },
    correctAnswer: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    },
    points: {
        type: Number,
        default: 1
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
