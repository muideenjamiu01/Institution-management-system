# Deployment Commands Guide

## 🚀 Deployment Steps for New Changes

### Prerequisites
Ensure you have:
- Node.js installed on deployment server
- PostgreSQL database running
- Environment variables configured (.env file)

---

## 📦 Backend Deployment

### 1. Pull Latest Changes
```bash
cd ims-backend
git pull origin dev-deploy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Migrations
```bash
# This applies all pending migrations including the new ones
npx prisma migrate deploy
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Build TypeScript Code
```bash
npm run build
```

### 6. (Optional) Seed Payment Types
If payment types don't exist in your database:
```bash
npx ts-node prisma/seedPaymentTypes.ts
```

### 7. (Optional) Create Sessions
To create academic sessions:
```bash
npx ts-node src/scripts/createSessions.ts
```

### 8. Restart Server
```bash
# If using PM2
pm2 restart ims-backend

# If using systemd
sudo systemctl restart ims-backend

# Or simply
npm start
```

---

## 🎨 Frontend Deployment

### 1. Pull Latest Changes
```bash
cd frontend
git pull origin feat-payment-modules
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Next.js Application
```bash
npm run build
```

### 4. Restart Frontend Server
```bash
# If using PM2
pm2 restart ims-frontend

# Or
npm start
```

---

## 🗄️ Database Migrations Applied

### Migration: `20260103223839_add_payment_configuration_fields`
Adds payment configuration to Invoice model:
- `allowPartialPayment` (Boolean)
- `minimumPayment` (Float, optional)
- `maximumInstallments` (Int, optional)
- `enforceDeadline` (Boolean)
- `lateFeePercentage` (Float, optional)
- `lateFeeAmount` (Float, optional)

### Migration: `20260103231024_add_student_applicant_relation_and_cgpa`
Adds to Student model:
- `cgpa` (Float, optional)
- Relation to Applicant model via `applicantId`

---

## ⚠️ Important Notes

### Environment Variables Required
Ensure these are set in your `.env` file:

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ims_db"
JWT_SECRET="your-jwt-secret"
PORT=5000

# Payment Gateways
PAYSTACK_SECRET_KEY="your-paystack-secret"
FLUTTERWAVE_SECRET_KEY="your-flutterwave-secret"

# Email (if configured)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔍 Verification Steps

After deployment, verify:

### 1. Check Database Migrations
```bash
npx prisma migrate status
```
Should show: "Database is up to date"

### 2. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### 3. Check Backend Logs
```bash
# If using PM2
pm2 logs ims-backend

# If using systemd
sudo journalctl -u ims-backend -f
```

### 4. Test Frontend
Visit: `http://localhost:3000` or your domain

---

## 🆕 New Features to Test

### Admin Features
1. **Sessions Management**: `/dashboard/sessions`
   - Create academic sessions
   - Manage session dates and status

2. **Payment Types**: `/dashboard/payment-types`
   - Configure payment types
   - Set active/inactive status

3. **Payment Configuration**: `/dashboard/payments`
   - Create invoices with partial payment options
   - Set minimum payments and installment limits
   - Configure late fees (percentage or fixed amount)
   - Enforce payment deadlines

4. **Student Details**: `/dashboard/students`
   - Click on student to view comprehensive details
   - 5 tabs: Personal, Academic, Courses, Payments, Documents

5. **Department Students/Courses**: `/dashboard/departments`
   - Click department name or student count to view students
   - Click course count to view courses
   - Filter by name, email, level

### Student Features
1. **Enhanced Payment UI**: `/student/payments`
   - View payment configuration (partial payment allowed, min amount, etc.)
   - Make custom partial payments
   - See late fees if applicable
   - View installment limits

---

## 🐛 Troubleshooting

### Migration Issues
If you see "Database schema is not in sync":
```bash
npx prisma migrate reset  # WARNING: This will delete all data
# OR
npx prisma migrate resolve --applied [migration_name]
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Prisma Client Issues
```bash
npx prisma generate
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 [PID]
```

---

## 📊 Database Backup (Recommended Before Deployment)

```bash
# Backup PostgreSQL database
pg_dump -U your_user -h localhost ims_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -U your_user -h localhost ims_db < backup_file.sql
```

---

## 🔄 Quick Deployment Script

Create a script `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying IMS Backend..."
cd ~/ims-backend
git pull origin dev-deploy
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart ims-backend

echo "🎨 Deploying IMS Frontend..."
cd ~/ims-frontend
git pull origin feat-payment-modules
npm install
npm run build
pm2 restart ims-frontend

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## 📝 Post-Deployment Checklist

- [ ] Database migrations applied successfully
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Can login as admin
- [ ] Can login as student
- [ ] Payment creation works
- [ ] Sessions management accessible
- [ ] Payment types management accessible
- [ ] Student details modal shows all information
- [ ] Department student/course filtering works

---

## 🆘 Support

If you encounter issues:
1. Check logs: `pm2 logs` or `journalctl`
2. Verify environment variables
3. Ensure database is accessible
4. Check port conflicts
5. Verify Prisma schema matches database

---

## 📚 Key Changes Summary

### Backend
- Payment configuration system
- Session management
- Payment types management
- Enhanced student queries with relations
- Partial payment validation
- Late fee calculation
- Filter handling improvements

### Frontend
- StudentDetailsModal component (5 tabs)
- Payment configuration UI
- Switch component for toggles
- Department students/courses modals
- Enhanced filtering and search
- Pagination component
- Real-time updates with React Query

### Database
- Invoice payment configuration fields
- Student CGPA field
- Student-Applicant relation
- Improved indexing
