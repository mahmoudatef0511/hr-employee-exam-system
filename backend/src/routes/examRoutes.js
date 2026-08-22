const express = require('express');
const examController = require('../controllers/examController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Both HR and employees can view exams/questions.
router.get('/', authenticate, examController.listExams);
router.get('/:id', authenticate, examController.getExam);
router.get('/:id/questions', authenticate, examController.getExamQuestions);

// Only HR can create exams/questions.
router.post('/', authenticate, authorize('hr'), examController.createExam);
router.post('/:id/questions', authenticate, authorize('hr'), examController.addQuestion);

module.exports = router;
