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
    getExamAnalytics
} = require('../controllers/examController');
const { protect, authorizeCreator } = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');

const router = express.Router();

router.use(protect); // All exam routes are protected

router.post('/', createExam);
router.get('/my-exams', getMyExams);
router.get('/enrolled', getEnrolledExams);
router.get('/search/:code', getExamByCode);

router.route('/:id')
    .get(getExamById)
    .put(authorizeCreator(Exam), updateExam)
    .delete(authorizeCreator(Exam), deleteExam);

router.post('/:id/publish', authorizeCreator(Exam), publishExam);
router.get('/:id/analytics', authorizeCreator(Exam), getExamAnalytics);

module.exports = router;
