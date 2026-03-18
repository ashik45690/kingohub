const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        selectedAnswer: {
            type: Number,
            required: true
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'submitted'
    },
    startTime: {
        type: Date
    },
    submitTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

SubmissionSchema.index({ examId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
