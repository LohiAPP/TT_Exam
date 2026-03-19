const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAttempts = await prisma.result.count();
    const activeExams = await prisma.exam.count({
      where: {
        isActive: true,
        endTime: {
          gt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAttempts,
        activeExams
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats
};
