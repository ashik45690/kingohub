const express = require('express');
const { getMyExams } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my-exams', getMyExams);

module.exports = router;
