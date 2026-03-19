const prisma = require('../utils/prisma');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const getResultsByExamId = async (req, res) => {
  const { examId } = req.params;
  try {
    const results = await prisma.result.findMany({
      where: { examId },
      include: {
        user: true,
        exam: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Fetch Results Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportResultsCSV = async (req, res) => {
  const { examId } = req.params;
  try {
    const results = await prisma.result.findMany({
      where: { examId },
      include: {
        user: true,
        exam: true
      }
    });

    const filePath = path.join(__dirname, `../../results_${examId}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'NAME' },
        { id: 'rollNo', title: 'ROLL NO' },
        { id: 'phone', title: 'PHONE' },
        { id: 'location', title: 'LOCATION' },
        { id: 'pincode', title: 'PINCODE' },
        { id: 'score', title: 'SCORE' },
        { id: 'percentage', title: 'PERCENTAGE' },
        { id: 'timeTaken', title: 'TIME TAKEN (s)' }
      ]
    });

    const records = results.map(r => ({
      name: r.user.name,
      rollNo: r.user.rollNo,
      phone: r.user.phone,
      location: r.user.location,
      pincode: r.user.pincode,
      score: r.score,
      percentage: r.percentage,
      timeTaken: r.timeTaken
    }));

    await csvWriter.writeRecords(records);
    res.download(filePath, `results_${examId}.csv`, (err) => {
      if (err) console.error(err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResult = async (req, res) => {
  const { id } = req.params;
  const { score, percentage, timeTaken } = req.body;
  try {
    const updatedResult = await prisma.result.update({
      where: { id },
      data: {
        score: parseInt(score),
        percentage: parseFloat(percentage),
        timeTaken: parseInt(timeTaken)
      }
    });
    res.json({ success: true, message: 'Result updated', data: updatedResult });
  } catch (error) {
    console.error('Update Result Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResult = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.result.delete({ where: { id } });
    res.json({ success: true, message: 'Result deleted' });
  } catch (error) {
    console.error('Delete Result Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getResultsByExamId, exportResultsCSV, updateResult, deleteResult };
