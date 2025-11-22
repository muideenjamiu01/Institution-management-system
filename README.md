# Institutional Management System (IMS)

A complete full-stack web application for managing academic institutions, built with Next.js, Express.js, Prisma, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin/Staff)
- **Admission Management**: Track applicants, make admission decisions, generate matric numbers
- **Student Registration**: Complete student profile management with department assignments
- **Course Management**: Create and manage courses with enrollments and prerequisites
- **Examination Module**: Record exam scores, automatic grading (A-F), transcript generation
- **Department Management**: Organize academic departments with students and courses
- **Analytics**: Grade distribution, exam analytics, and performance tracking
- **Responsive UI**: Clean, modern interface built with Tailwind CSS and Shadcn/UI
- **RESTful API**: Well-documented API endpoints with validation and error handling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MySQL 8.0+
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd institutional-management-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
DATABASE_URL="mysql://username:password@localhost:3306/ims_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup

Create the MySQL database:

```bash
mysql -u root -p
CREATE DATABASE ims_db;
EXIT;
```

Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed the Database

Populate the database with 1000+ sample records:

```bash
npm run prisma:seed
```

This will create:
- 2 users (admin and staff)
- 10 departments
- 300 applicants with admission decisions
- 500 students
- 100 courses
- Course registrations
- 50 exams with scores

### 5. Start the Backend

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:5000`

### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 7. Start the Frontend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 🔑 Default Login Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Email: `admin@ims.edu`
- Password: `password123`

**Staff Account:**
- Email: `staff@ims.edu`
- Password: `password123`

## 📁 Project Structure

```
institutional-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Seed script
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # Prisma client
│   │   │   └── logger.ts          # Winston logger
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── admissionController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── courseController.ts
│   │   │   ├── examController.ts
│   │   │   └── departmentController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   ├── errorHandler.ts    # Global error handler
│   │   │   └── validation.ts      # Zod validation
│   │   ├── routes/                # API routes
│   │   └── server.ts              # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admissions/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── exams/page.tsx
│   │   │   ├── departments/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                    # Shadcn/UI components
│   ├── lib/
│   │   ├── api.ts                 # Axios instance
│   │   └── utils.ts               # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
│
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Admissions
- `GET /api/admissions/applicants` - List applicants (with pagination)
- `POST /api/admissions/applicants` - Create applicant
- `GET /api/admissions/applicants/:id` - Get applicant details
- `PUT /api/admissions/applicants/:id` - Update applicant
- `DELETE /api/admissions/applicants/:id` - Delete applicant
- `POST /api/admissions/applicants/:id/decision` - Make admission decision
- `POST /api/admissions/applicants/:id/convert` - Convert to student

### Students
- `GET /api/students` - List students (with pagination, filters)
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/transcript` - Get student transcript

### Courses
- `GET /api/courses` - List courses (with pagination, filters)
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/register` - Register student for course
- `GET /api/courses/student/:studentId` - Get student courses

### Exams
- `GET /api/exams` - List exams (with pagination, filters)
- `POST /api/exams` - Create exam
- `GET /api/exams/:id` - Get exam details
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `POST /api/exams/scores` - Record exam score
- `GET /api/exams/:examId/scores` - Get exam scores
- `GET /api/exams/:examId/analytics` - Get exam analytics

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department (Admin only)
- `GET /api/departments/:id` - Get department details
- `PUT /api/departments/:id` - Update department (Admin only)
- `DELETE /api/departments/:id` - Delete department (Admin only)

## 🔒 Security Features

- JWT-based authentication with token expiry
- Role-based access control (RBAC)
- Password hashing with bcrypt
- HTTP security headers (Helmet)
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- SQL injection prevention (Prisma ORM)

## 📊 Database Schema

The system uses 10 main tables:

- **users** - System users (Admin/Staff)
- **departments** - Academic departments
- **applicants** - Admission applicants
- **admission_decisions** - Admission status
- **matric_numbers** - Generated matriculation numbers
- **students** - Enrolled students
- **courses** - Course offerings
- **course_registrations** - Student-course enrollment (many-to-many)
- **exams** - Examination details
- **scores** - Exam scores and grades

## 🧪 Testing the Application

1. **Login**: Navigate to `http://localhost:3000` and login with admin credentials
2. **Dashboard**: View system statistics and quick actions
3. **Admissions**: Review applicants, approve/reject applications
4. **Students**: Browse student records with pagination
5. **Departments**: View academic departments and their statistics
6. **Courses**: Explore course offerings and enrollments
7. **Exams**: Check exam schedules and recorded scores

## 🚀 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a production MySQL database
3. Update `JWT_SECRET` with a strong secret
4. Configure CORS for your frontend domain
5. Enable SSL/HTTPS
6. Use a process manager (PM2, systemd)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Set `NEXT_PUBLIC_API_URL` to your production API

## 📝 Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=mysql://user:pass@localhost:3306/ims_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with sample data
npm run prisma:studio    # Open Prisma Studio (GUI)
```

### Frontend
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 📚 Key Technologies & Libraries

- **Next.js 15**: React framework with App Router
- **Express.js**: Fast web framework for Node.js
- **Prisma**: Modern ORM for TypeScript & Node.js
- **MySQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **Zod**: TypeScript-first schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Re-usable components built with Radix UI
- **Winston**: Professional logging library
- **Helmet**: Security middleware for Express
- **date-fns**: Modern date utility library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For issues, questions, or contributions, please open an issue in the repository.

---

**Built with ❤️ using Next.js, Express.js, Prisma, and MySQL**
