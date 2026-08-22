const express = require('express');
const authRoutes = require('./authRoutes');
const examRoutes = require('./examRoutes');
const employeeRoutes = require('./employeeRoutes');
const hrRoutes = require('./hrRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/exams', examRoutes);
router.use('/employee', employeeRoutes);
router.use('/hr', hrRoutes);

module.exports = router;
