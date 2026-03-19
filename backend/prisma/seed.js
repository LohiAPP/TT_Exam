const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const exam = await prisma.exam.upsert({
    where: { examId: 'PREMIUM001' },
    update: {
      startTime: now,
      endTime: twoHoursLater,
      isActive: true
    },
    create: {
      title: 'Premium General Intelligence Test',
      examId: 'PREMIUM001',
      duration: 60,
      startTime: now,
      endTime: twoHoursLater,
      totalQuestions: 10,
      isActive: true,
      questions: {
        create: [
          {
            question: 'Which of the following describes Glassmorphism?',
            optionA: 'Flat design with shadows', optionB: 'Frosted glass effect with transparency', optionC: 'Solid dark theme', optionD: '3D neomorphism',
            correct: 'B'
          },
          {
            question: 'What is the primary characteristic of Next.js?',
            optionA: 'Only client side rendering', optionB: 'Only server side rendering', optionC: 'Hybrid rendering (SSR/SSG/ISR)', optionD: 'Static pages only',
            correct: 'C'
          },
          {
            question: 'What is Prisma?',
            optionA: 'A Frontend Framework', optionB: 'A Database Engine', optionC: 'An ORM for Node.js & TypeScript', optionD: 'A UI Component Library',
            correct: 'C'
          },
          {
            question: 'Which color is #06B6D4?',
            optionA: 'Deep Blue', optionB: 'Cyan/Teal', optionC: 'Purple', optionD: 'Red',
            correct: 'B'
          },
          {
            question: 'What is the capital of Japan?',
            optionA: 'Kyoto', optionB: 'Osaka', optionC: 'Tokyo', optionD: 'Nagoya',
            correct: 'C'
          },
          {
             question: 'Which of the following is a CSS Framework?',
             optionA: 'React', optionB: 'Tailwind CSS', optionC: 'Node.js', optionD: 'PostgreSQL',
             correct: 'B'
          },
          {
             question: 'What does API stand for?',
             optionA: 'Advanced Programming Interface', optionB: 'Application Programming Interface', optionC: 'Application Process Integration', optionD: 'Automated Program Interface',
             correct: 'B'
          },
          {
             question: 'Which tag is used for the largest heading in HTML?',
             optionA: '<heading>', optionB: '<h6>', optionC: '<h1>', optionD: '<head>',
             correct: 'C'
          },
          {
             question: 'What is the purpose of the useEffect hook in React?',
             optionA: 'To manage state', optionB: 'To handle side effects', optionC: 'To optimize rendering', optionD: 'To navigate between pages',
             correct: 'B'
          },
          {
             question: 'Which database is commonly used with Prisma?',
             optionA: 'MongoDB', optionB: 'PostgreSQL', optionC: 'Redis', optionD: 'SQLite',
             correct: 'B'
          }
        ]
      }
    }
  });

  console.log('Database seeded with 10 mock questions for PREMIUM001!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
