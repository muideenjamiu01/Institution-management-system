# Comprehensive Admin Payment System

## Overview
This enhanced admin payment dashboard provides a complete solution for managing student payments, invoices, and financial tracking with advanced features including real-time statistics, CSV export, and comprehensive filtering.

## Features

### 1. **Dashboard Statistics**
- **Total Invoices**: View total number of invoices created
- **Collection Rate**: Track payment success rate as a percentage
- **Total Collected**: See total revenue collected
- **Outstanding Balance**: Monitor pending payments

### 2. **Invoice Creation**
Create invoices for individual students, specific groups, or all students:
- **Payment Types**: 
  - School Fee
  - Examination Fee
  - Technology Fee
  - Development Fee
  - Laboratory Fee
  - Library Fee
  - Other (Convocation, ICT, Accreditation, etc.)
- **Filters**: Create by Level, Department, or for all students
- **Flexible Amounts**: Set custom amounts per invoice type
- **Due Dates**: Specify payment deadlines

### 3. **Advanced Filtering**
Filter invoices by multiple criteria:
- Academic Session
- Payment Status (Pending, Paid, Partially Paid, Failed)
- Date Range (from/to dates)
- Student Search (by name or matric number)

### 4. **CSV Export**
Export payment data with all filters applied:
- Invoice numbers
- Student details (name, matric no, department, level)
- Payment type and amounts
- Payment status and session
- Due dates and creation dates

### 5. **Real-time Updates**
- Refresh button for manual updates
- Automatic data refetch when filters change
- React Query integration for optimized caching

## API Endpoints

### Invoice Management
```
POST   /admin/payments/invoices          - Create invoices
GET    /admin/payments/invoices          - Get all invoices with filters
PUT    /admin/payments/invoices/:id      - Update invoice
DELETE /admin/payments/invoices/:id      - Delete invoice
```

### Statistics & Reports
```
GET    /admin/payments/statistics/enhanced  - Get payment statistics
GET    /admin/payments/export               - Export payments to CSV
GET    /admin/payments/sessions             - Get academic sessions
```

### Student Operations
```
GET    /admin/payments/students                         - Get students for invoice
POST   /admin/payments/students/:id/generate-invoices   - Generate invoices for student
GET    /admin/payments/students/:id/payment-summary     - Get student payment summary
```

## Usage Guide

### Creating Invoices

#### For All Students
1. Click "Create Invoice" button
2. Select Payment Type
3. Select Academic Session
4. Enter Amount
5. Leave Level and Department as "All"
6. Click "Create Invoices"

#### For Specific Level
1. Follow steps 1-4 above
2. Select specific Level (e.g., "200 Level")
3. Leave Department as "All"
4. Click "Create Invoices"

#### For Specific Department
1. Follow steps 1-4 above
2. Select specific Department
3. Leave Level as "All" or select specific level
4. Click "Create Invoices"

### Filtering Invoices
1. Use session dropdown to filter by academic year
2. Use status dropdown to filter by payment status
3. Enter date range to see invoices within specific period
4. Use search box to find specific students

### Exporting Data
1. Apply desired filters (session, status, date range)
2. Click "Export CSV" button
3. File downloads automatically with current date in filename
4. Open in Excel/Google Sheets for analysis

## Session Management

### Creating Sessions
Run this script to create default academic sessions:
```bash
cd ims-backend
npx ts-node src/scripts/createSessions.ts
```

This creates:
- Current academic year (active)
- Next academic year (inactive)
- Previous academic year (inactive)

### Manual Session Creation
Use the database directly or create an admin UI for session management:
```sql
INSERT INTO "Session" (name, "startDate", "endDate", "isActive")
VALUES ('2025/2026', '2025-09-01', '2026-08-31', true);
```

## Automatic Fee Generation

The system automatically generates standard fees when students are created:
- School Fee (based on level: 100-200: ₦150,000, 300-400: ₦180,000, 500+: ₦200,000)
- Examination Fee (₦10,000-₦15,000 based on level)
- Technology Fee (₦10,000)
- Development Fee (₦5,000)

### Fee Structure by Level
```
Level 100-200:
- School Fee: ₦150,000
- Examination Fee: ₦10,000
- Technology Fee: ₦10,000
- Development Fee: ₦5,000

Level 300-400:
- School Fee: ₦180,000
- Examination Fee: ₦12,000
- Technology Fee: ₦10,000
- Development Fee: ₦5,000

Level 500+:
- School Fee: ₦200,000
- Examination Fee: ₦15,000
- Technology Fee: ₦10,000
- Development Fee: ₦5,000
```

## Payment History Migration

When applicants are converted to students:
1. Application Fee payment is migrated as historical invoice
2. Acceptance Fee payment is migrated as historical invoice
3. New invoices are automatically generated for school fees
4. All payment history is preserved in student portal

## Technical Details

### Frontend Components
- **Location**: `frontend/app/dashboard/payments/page.tsx`
- **State Management**: React Query with automatic caching
- **UI Framework**: Shadcn/ui with Tailwind CSS
- **Form Handling**: React hooks for controlled components

### Backend Controllers
- **Student Payment Controller**: `ims-backend/src/controllers/studentPaymentController.ts`
  - `getPaymentStatistics`: Calculates invoice and payment metrics
  - `exportPaymentsCSV`: Generates CSV export with all fields

- **Admin Payment Controller**: `ims-backend/src/controllers/adminPaymentController.ts`
  - `createInvoices`: Bulk invoice creation
  - `getAllInvoices`: Filtered invoice retrieval with pagination
  - `getSessions`: Academic session management

### Database Schema
```prisma
model Invoice {
  id          Int           @id @default(autoincrement())
  invoiceNo   String        @unique
  studentId   Int
  sessionId   Int
  semesterId  Int?
  type        InvoiceType
  description String?
  amount      Float
  amountPaid  Float         @default(0)
  balance     Float
  level       Int?
  status      PaymentStatus @default(PENDING)
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  student     Student       @relation(fields: [studentId], references: [id])
  session     Session       @relation(fields: [sessionId], references: [id])
  payments    Payment[]
}
```

## Troubleshooting

### No Sessions Showing
**Problem**: Session dropdown is empty
**Solution**: Run `npx ts-node src/scripts/createSessions.ts` to create default sessions

### CSV Export Not Working
**Problem**: Export button doesn't download file
**Solution**: Check browser console for errors, ensure API endpoint `/admin/payments/export` is accessible

### Statistics Not Updating
**Problem**: Dashboard numbers don't change after creating invoices
**Solution**: Click the "Refresh" button or wait for React Query to refetch (automatic after 5 minutes)

### Invoice Creation Fails
**Problem**: "Failed to create invoices" error
**Solution**: 
1. Ensure session is selected and active
2. Check that amount is a valid number
3. Verify students exist for the selected filters

## Future Enhancements

Planned features for future releases:
- [ ] PDF receipt generation and download
- [ ] Real-time payment notifications
- [ ] Payment reminders via email/SMS
- [ ] Bulk payment recording from bank statements
- [ ] Advanced analytics with charts and graphs
- [ ] Payment plan management (installment tracking)
- [ ] Integration with more payment gateways
- [ ] Automated late payment penalties

## Support

For issues or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Check backend logs: `ims-backend/logs/combined.log`
4. Check frontend console for errors
5. Verify database connection and migrations
