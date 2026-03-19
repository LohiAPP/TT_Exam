const prisma = require('../utils/prisma');

const startExam = async (req, res) => {
  const { name, rollNo, phone, location, pincode, examId } = req.body;

  try {
    // Check if exam exists and is active
    let exam;
    if (examId) {
      exam = await prisma.exam.findUnique({ where: { examId } });
    } else {
      // Find the first active exam if no examId is provided
      exam = await prisma.exam.findFirst({ where: { isActive: true } });
    }

    if (!exam || !exam.isActive) {
      return res.status(404).json({ success: false, message: 'No active exam found' });
    }

    const currentTime = new Date();
    if (currentTime < new Date(exam.startTime)) {
      return res.status(403).json({ 
        success: false, 
        message: `Exam has not started yet. It starts at ${exam.startTime}` 
      });
    }
    if (currentTime > new Date(exam.endTime)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Exam has already ended' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { rollNo } });
    
    if (existingUser) {
      // Validate that details match existing user record
      if (existingUser.name !== name || existingUser.phone !== phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Roll number is already registered with different details. Please use your registered name and mobile number.' 
        });
      }

      // Check if this specific user already attempted this exam
      const existingResult = await prisma.result.findUnique({
        where: {
          userId_examId: {
            userId: existingUser.id,
            examId: exam.id
          }
        }
      });

      if (existingResult) {
        return res.status(400).json({ success: false, message: 'Details are already used' });
      }
    }

    // Upsert/Update user (if they passed the checks above)
    const user = await prisma.user.upsert({
      where: { rollNo },
      update: { name, phone, location, pincode },
      create: { name, rollNo, phone, location, pincode }
    });

    res.json({
      success: true,
      message: 'Exam started',
      data: {
        userId: user.id,
        examInternalId: exam.id,
        duration: exam.duration,
        title: exam.title
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitExam = async (req, res) => {
  const { userId, examId, answers, timeTaken } = req.body;

  try {
    const questions = await prisma.question.findMany({
      where: { examId }
    });

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score++;
      }
    });

    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions found for this exam' });
    }

    const percentage = (score / questions.length) * 100;

    const result = await prisma.result.create({
      data: {
        userId,
        examId,
        score,
        percentage,
        answers,
        timeTaken,
        submitted: true
      }
    });

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        score,
        total: questions.length,
        percentage
      }
    });
  } catch (error) {
    console.error('Submission Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'You have already submitted this exam.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { startTime: 'desc' }
    });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createExam = async (req, res) => {
  const { title, examId, duration, startTime, endTime, totalQuestions } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        examId,
        duration: parseInt(duration),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalQuestions: parseInt(totalQuestions)
      }
    });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, examId, duration, startTime, endTime, totalQuestions, isActive } = req.body;
  try {
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        examId,
        duration: parseInt(duration),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalQuestions: parseInt(totalQuestions),
        isActive
      }
    });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({ where: { id } });
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startExam, submitExam, getExams, createExam, updateExam, deleteExam };
