const express = require('express');
const multer = require('multer');
const { getQuestionsByExamId, createQuestion, updateQuestion, deleteQuestion, importQuestions, bulkDeleteQuestions } = require('../controllers/questionController');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/:examId', getQuestionsByExamId);
router.post('/', createQuestion);
router.post('/bulk-delete', bulkDeleteQuestions);
router.post('/import', upload.single('file'), importQuestions);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
