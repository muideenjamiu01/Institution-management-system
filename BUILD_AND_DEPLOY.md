# Build and Deploy Instructions

## Local Testing & Production Build Commands

### 1. Backend Build and Test

```bash
# Navigate to backend
cd ims-backend

# Install dependencies (if needed)
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build TypeScript code
npm run build

# Seed the database with comprehensive data
npm run prisma:seed

# Test the backend build
node dist/server.js
```

### 2. Frontend Build and Test

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if needed)
npm install

# Build the Next.js application
npm run build

# Test the production build locally
npm run start
```

### 3. Full Local Production Simulation

#### Terminal 1 - Backend:
```bash
cd ims-backend
npm run build
npm start
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run build
npm start
```

## Production Deployment Commands

### Backend Deployment (Render/Railway/etc.)

```bash
cd ims-backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build the application
npm run build

# Run migrations
npx prisma migrate deploy

# Seed production database (ONLY ONCE on fresh database)
npm run prisma:seed

# Start the server
npm start
```

### Frontend Deployment (Vercel/Netlify/etc.)

```bash
cd frontend

# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

## Git Commit and Push

After verifying everything works locally:

```bash
# From project root
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: improve course form PDF alignment and add course type (elective/core) display"

# Push to remote repository
git push origin main
```

## Production Seeding (One-time setup)

If deploying to a fresh production database:

```bash
cd ims-backend

# Run comprehensive seed
npm run prisma:seed
```

## Testing with Carry Over Students

After seeding, test with these accounts:

**Students with Carry Over Courses:**
- Username: `IMS/2025/CSC/00088` - Password: `password123` (3 failed courses)
- Username: `IMS/2024/CSC/00090` - Password: `password123` (3 failed courses)
- Username: `IMS/2024/CSC/00093` - Password: `password123` (3 failed courses)

## Environment Variables Required

### Backend (.env)
```
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
PORT=5000
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Build Output Verification

### Backend
- Check `dist/` folder contains compiled JavaScript files
- Verify `dist/server.js` exists

### Frontend
- Check `.next/` folder contains build output
- Verify no build errors in terminal

## Deployment Checklist

- [ ] Backend builds successfully (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Database seeded with test data (`npm run prisma:seed`)
- [ ] Both servers start without errors
- [ ] Frontend can connect to backend API
- [ ] Login functionality works
- [ ] Course registration works
- [ ] PDF download shows correct course types (Core/Elective)
- [ ] Carry over courses display correctly
- [ ] All changes committed to git
- [ ] Code pushed to repository

## Recent Changes

1. **PDF Course Form Improvements:**
   - Fixed student information alignment
   - Aligned all section headers properly
   - Added course type display (Elective vs Core)

2. **Carry Over Courses Feature:**
   - Added CarryOverSection component
   - Updated API to support carry over courses
   - Enhanced course registration to include carry over courses
   - Updated registration history to display carry over courses separately

3. **UI Enhancements:**
   - Improved student portal styling
   - Better visual distinction for carry over courses
   - Enhanced registration details modal
