const express = require('express');
const {
    createExam,
    getMyExams,
    getEnrolledExams,
    getExamByCode,
    getExamById,
    updateExam,
    deleteExam,
    publishExam,
    getExamAnalytics,
    getPublishedExams,
    registerForExam,
    checkRegistration,
    startExam,
    publishResults
} = require('../controllers/examController');
const { protect, authorizeCreator } = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');

const router = express.Router();

// Public routes (Registration)
router.get('/public', getPublishedExams);
router.post('/:id/register', protect, registerForExam);
router.get('/:id/registration-check', protect, checkRegistration);
router.post('/:id/start', protect, startExam);

router.use(protect); // Existing protected routes

router.post('/', createExam);
router.get('/my-exams', getMyExams);
router.get('/enrolled', getEnrolledExams);
router.get('/search/:code', getExamByCode);

router.route('/:id')
    .get(getExamById)
    .put(authorizeCreator(Exam), updateExam)
    .delete(authorizeCreator(Exam), deleteExam);

router.post('/:id/publish', authorizeCreator(Exam), publishExam);
router.post('/:id/publish-results', authorizeCreator(Exam), publishResults);
router.get('/:id/analytics', authorizeCreator(Exam), getExamAnalytics);

module.exports = router;
