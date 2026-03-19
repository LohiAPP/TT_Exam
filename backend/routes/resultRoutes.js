const express = require('express');
const { getResultsByExamId, exportResultsCSV, updateResult, deleteResult } = require('../controllers/resultController');
const router = express.Router();

router.get('/:examId', getResultsByExamId);
router.get('/:examId/export', exportResultsCSV);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

module.exports = router;
