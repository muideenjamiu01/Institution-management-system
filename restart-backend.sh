#!/bin/bash

# Regenerate Prisma Client and Restart Server

echo "🔄 Regenerating Prisma Client..."
cd backend
npx prisma generate

echo "✅ Prisma Client regenerated!"
echo ""
echo "🚀 Starting development server..."
npm run dev
