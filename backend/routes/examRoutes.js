const express = require('express');
const { startExam, submitExam, getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { getDashboardStats } = require('../controllers/adminController');
const router = express.Router();

router.post('/start', startExam);
router.post('/submit', submitExam);
router.get('/', getExams);
router.get('/stats', getDashboardStats);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
