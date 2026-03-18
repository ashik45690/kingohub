const express = require('express');
const {
    submitExam,
    getExamSubmissions,
    getUserSubmission
} = require('../controllers/submissionController');
const { protect, authorizeCreator } = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');

const router = express.Router();

router.use(protect);

router.post('/', submitExam);
router.get('/exam/:examId', authorizeCreator(Exam), getExamSubmissions);
router.get('/exam/:examId/user/:userId', getUserSubmission);

module.exports = router;
