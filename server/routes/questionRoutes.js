const express = require('express');
const {
    addQuestion,
    getQuestionsByExam,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');
const { protect, authorizeCreator } = require('../middleware/authMiddleware');
const Question = require('../models/Question');

const router = express.Router();

router.use(protect);

router.post('/', addQuestion);
router.get('/exam/:examId', getQuestionsByExam);

router.route('/:id')
    .put(authorizeCreator(Question), updateQuestion)
    .delete(authorizeCreator(Question), deleteQuestion);

module.exports = router;
