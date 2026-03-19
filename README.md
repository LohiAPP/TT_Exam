# Online Exam Web Application

A full-stack online examination system built with Next.js, Node.js, and Prisma.

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. Configure `DATABASE_URL` in `.env`
4. `npx prisma migrate dev`
5. `npm run seed`
6. `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `.env.local`
4. `npm run dev`

## Admin Credentials
- **Username**: admin
- **Password**: admin123
