const express = require('express');
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('employee'));

router.get('/submissions', employeeController.listMySubmissions);
router.get('/submissions/:id', employeeController.getMySubmission);
router.post('/exams/:id/submit', employeeController.submitExam);

module.exports = router;
