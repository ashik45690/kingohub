const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Middleware to protect routes using session auth
 */
exports.protect = async (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const rawUser = req.user;
        const userId = rawUser?._id || rawUser?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const userDoc = await User.findById(userId);
        if (!userDoc) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        req.user = userDoc;
        req.userId = userDoc._id.toString();
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

/**
 * Middleware to restrict access to the creator of the exam
 */
exports.authorizeCreator = (model) => async (req, res, next) => {
    try {
        const docId = req.params.id || req.params.examId || req.body.examId;
        let doc = await model.findById(docId);
        
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        let creatorId;
        
        // If it's a Question model, we need to check the Exam creator
        if (model.modelName === 'Question') {
            const exam = await mongoose.model('Exam').findById(doc.examId);
            if (!exam) return res.status(404).json({ success: false, message: 'Associated exam not found' });
            creatorId = exam.createdBy.toString();
        } else {
            creatorId = doc.createdBy ? doc.createdBy.toString() : doc.userId.toString();
        }

        const requesterId = req.userId || req.user?.id;
        if (!req.user || !requesterId || creatorId !== requesterId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to perform this action'
            });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
