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
    }],
    registrationClosingDate: {
        type: Date
    },
    resultPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate duration before validation so 'required' check passes
ExamSchema.pre('validate', function() {
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            if (end <= start) {
                this.invalidate('endDate', 'End date must be after start date');
            } else {
                // Calculate difference in minutes
                const diffMs = end.getTime() - start.getTime();
                this.timeLimitMinutes = Math.floor(diffMs / 60000);
            }
        }
    }
});

module.exports = mongoose.model('Exam', ExamSchema);
