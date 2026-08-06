const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fullName: {
        type: String,
        required: false,
        default: ''
    },
    dob: {
        type: Date,
        required: false
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure one registration per user per exam if userId is present
// Or one registration per email per exam
RegistrationSchema.index({ examId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
