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
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true
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
