const express = require('express');
const hrController = require('../controllers/hrController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('hr'));

router.get('/submissions', hrController.listAllSubmissions);
router.get('/submissions/:id', hrController.getSubmissionDetails);

router.get('/employees', hrController.listEmployees);
router.get('/assignments', hrController.listAssignments);
router.post('/assignments', hrController.assignExam);
router.delete('/assignments/:id', hrController.unassignExam);

module.exports = router;
