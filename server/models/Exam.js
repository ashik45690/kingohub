const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    authorizedEmails: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    timeLimitMinutes: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', ExamSchema);
