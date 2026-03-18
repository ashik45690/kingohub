const express = require('express');
const { joinExam } = require('../controllers/examFlowController');
const { submitExam } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/join', joinExam);
router.post('/submit', submitExam);

module.exports = router;
