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
    type: {
        type: String,
        enum: ['objective', 'descriptive'],
        default: 'objective'
    },
    options: {
        A: { type: String, required: false },
        B: { type: String, required: false },
        C: { type: String, required: false },
        D: { type: String, required: false }
    },
    correctAnswer: {
        type: String,
        required: false,
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
