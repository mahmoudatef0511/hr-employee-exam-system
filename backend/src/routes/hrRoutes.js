const express = require('express');
const hrController = require('../controllers/hrController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('hr'));

router.get('/submissions', hrController.listAllSubmissions);
router.get('/submissions/:id', hrController.getSubmissionDetails);

module.exports = router;
