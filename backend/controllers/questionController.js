const prisma = require('../utils/prisma');

const getQuestionsByExamId = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await prisma.exam.findFirst({
      where: {
        OR: [
          { id: examId },
          { examId: examId }
        ]
      },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correct: true
          }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({ success: true, data: exam.questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createQuestion = async (req, res) => {
  const { examId, question, optionA, optionB, optionC, optionD, correct } = req.body;

  try {
    const newQuestion = await prisma.question.create({
      data: {
        examId,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correct
      }
    });

    res.json({ success: true, message: 'Question created', data: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data
    });

    res.json({ success: true, message: 'Question updated', data: updatedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.question.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const xlsx = require('xlsx');

const importQuestions = async (req, res) => {
  const { examId } = req.body;
  if (!req.file || !examId) {
    return res.status(400).json({ success: false, message: 'File and Exam ID are required' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Format should be: Question, OptionA, OptionB, OptionC, OptionD, Correct
    const questionsToCreate = data.map(row => ({
      examId,
      question: row.Question || row.question,
      optionA: row.OptionA || row.optionA,
      optionB: row.OptionB || row.optionB,
      optionC: row.OptionC || row.optionC,
      optionD: row.OptionD || row.optionD,
      correct: (row.Correct || row.correct || 'A').toString().toUpperCase()
    }));

    await prisma.question.createMany({
      data: questionsToCreate
    });

    res.json({ success: true, message: `Successfully imported ${questionsToCreate.length} questions` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuestionsByExamId, createQuestion, updateQuestion, deleteQuestion, importQuestions };
