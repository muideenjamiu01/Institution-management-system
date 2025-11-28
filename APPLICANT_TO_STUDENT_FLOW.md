# Applicant to Student Conversion Flow

## Overview
Complete automated flow from applicant admission to active student with full portal access.

## Current Implementation

### Step 1-3: Applicant Phase (✅ COMPLETE)
1. **Applicant Registration**
   - Username format: `IMS2025-00456`
   - Email verification
   - Temporary password provided

2. **Application Submission**
   - Personal information
   - Academic background
   - Program selection (ND, HND, BSC, MSC, PHD)
   - Department selection

3. **Application Fee Payment**
   - Amount: ₦20,000
   - Payment via Paystack/Flutterwave
   - Status changes to application fee paid

### Step 4-5: Admin Review (✅ COMPLETE)
4. **Admin Reviews Application**
   - View applicant details
   - Check qualifications
   - Make decision (APPROVE/REJECT)

5. **Admission Decision**
   - If APPROVED: Email sent to applicant
   - Status changes to APPROVED
   - Applicant can now pay acceptance fee

### Step 6-7: Acceptance Fee (✅ COMPLETE)
6. **Applicant Pays Acceptance Fee**
   - Amount: ₦50,000
   - Only available after approval
   - Payment via Paystack/Flutterwave

7. **Mat ric Number Generation** (✅ AUTOMATED)
   - Format: `IMS/2025/CVE/00001`
   - Generated automatically after acceptance fee payment
   - Unique per department and year

### Step 8: Auto-Convert to Student (✅ IMPLEMENTED)
When acceptance fee is verified, the system automatically:

1. **Creates Student Account**
   ```typescript
   - username: matric number (IMS/2025/CVE/00001)
   - matricNo: same as username
   - password: transferred from applicant
   - email: same as applicant
   - department & program: transferred
   - currentLevel: auto-assigned based on program type
     - ND: 100
     - HND: 300
     - BSC: 100
     - MSC: 500
     - PHD: 700
   - status: ACTIVE
   ```

2. **Links Matric Number**
   - Updates matricNumber table with studentId

3. **Creates Acceptance Fee Invoice**
   - Invoice type: ACCEPTANCE_FEE
   - Status: PAID
   - Records payment in student's account

4. **Creates Welcome Notification**
   - Title: "Welcome to Student Portal!"
   - Message includes matric number
   - Prompts for document upload

### Step 9: Document Upload (🔨 TO IMPLEMENT)
Student must upload required documents:

**Required Documents:**
- Passport photograph
- O-Level result (WAEC/NECO)
- Birth certificate
- Local government certificate
- Admission letter
- Medical certificate (optional)

**Database Table Needed:**
```prisma
model StudentDocument {
  id          Int      @id @default(autoincrement())
  studentId   Int
  type        DocumentType // PASSPORT, OLEVEL, BIRTH_CERT, LG_CERT, ADMISSION_LETTER
  fileUrl     String
  fileName    String
  fileSize    Int
  status      DocumentStatus @default(PENDING) // PENDING, APPROVED, REJECTED
  rejectionReason String?
  uploadedAt  DateTime @default(now())
  verifiedAt  DateTime?
  verifiedBy  String?
  student     Student  @relation(fields: [studentId], references: [id])
  
  @@index([studentId])
  @@index([type])
  @@index([status])
}

enum DocumentType {
  PASSPORT
  OLEVEL
  BIRTH_CERT
  LG_CERT
  ADMISSION_LETTER
  MEDICAL_CERT
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Step 10: Course Registration (🔨 TO IMPLEMENT)
After documents are uploaded/approved:

**Requirements:**
- All required documents uploaded
- Acceptance fee paid (✅ done)
- Active session exists
- Student status: ACTIVE

**Features:**
- View available courses for level
- Register courses (max credits check)
- Print registration slip
- View registered courses

### Step 11: School Fees Payment (🔨 TO IMPLEMENT)
Generate school fees invoice:

**Invoice Generation:**
```typescript
- Type: SCHOOL_FEE
- Amount: Based on level and program
- Session: Current active session
- Semester: Current semester
- Status: PENDING
```

**Payment Methods:**
- Paystack/Flutterwave (online)
- Wallet payment (if funded)
- Partial payment allowed

### Step 12: Full Portal Access (🔨 TO IMPLEMENT)
After school fees payment:

**Student Can:**
- ✅ View dashboard
- ✅ Check profile
- ✅ View registered courses
- 🔨 Submit assignments
- 🔨 Check results
- 🔨 View timetable
- 🔨 Download receipts
- 🔨 Print ID card
- 🔨 View transcript

## Current Status

### ✅ Completed Features
1. Applicant registration with IMS username format
2. Application submission and fee payment
3. Admin admission decision workflow
4. Acceptance fee payment
5. Automatic matric number generation
6. **Automatic student account creation** (NEW!)
7. Student portal login with matric number
8. Basic student dashboard

### 🔨 Pending Implementation

#### Priority 1: Document Upload System
- [ ] Create StudentDocument model in schema
- [ ] Create document upload API endpoints
- [ ] Create document upload page in student portal
- [ ] Admin document verification interface
- [ ] Auto-enable course registration after verification

#### Priority 2: Course Registration
- [ ] List available courses endpoint
- [ ] Course registration endpoint with validation
- [ ] Registration slip generation
- [ ] Course drop functionality
- [ ] Credit unit validation

#### Priority 3: School Fees Management
- [ ] Auto-generate school fees invoice
- [ ] Invoice management for students
- [ ] Payment reminders
- [ ] Partial payment support
- [ ] Receipt generation

#### Priority 4: Full Portal Features
- [ ] Assignment submission
- [ ] Results viewing
- [ ] Timetable display
- [ ] ID card generation
- [ ] Transcript generation

## Database Migration Needed

```bash
# Add StudentDocument model to schema.prisma
# Then run:
npx prisma migrate dev --name add_student_documents
npx prisma generate
```

## API Endpoints to Create

### Document Upload
```
POST   /api/student/documents/upload
GET    /api/student/documents
DELETE /api/student/documents/:id

# Admin
GET    /api/admin/documents
PATCH  /api/admin/documents/:id/verify
PATCH  /api/admin/documents/:id/reject
```

### Course Registration
```
GET    /api/student/courses/available
POST   /api/student/courses/register
DELETE /api/student/courses/:id/drop
GET    /api/student/courses/registered
GET    /api/student/courses/registration-slip
```

### Invoices
```
GET    /api/student/invoices
GET    /api/student/invoices/:id
POST   /api/student/invoices/:id/pay
```

## Environment Variables

```env
# Already configured
PAYSTACK_SECRET_KEY=sk_test_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
APPLICANT_PORTAL_URL=http://localhost:3000/applicant
STUDENT_PORTAL_URL=http://localhost:3000/student

# Might need
CLOUDINARY_URL=cloudinary://...  # For document uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

## Frontend Pages to Create

### Student Portal
1. `/student/(portal)/documents` - Document upload page
2. `/student/(portal)/courses` - Course registration
3. `/student/(portal)/courses/registration-slip` - Print slip
4. `/student/(portal)/invoices` - View invoices
5. `/student/(portal)/invoices/[id]` - Invoice details & payment

### Admin Portal
1. `/dashboard/documents` - Document verification
2. `/dashboard/invoices` - Invoice management

## Testing Checklist

- [ ] Applicant can register with IMS username
- [ ] Applicant can pay application fee
- [ ] Admin can approve admission
- [ ] Applicant can pay acceptance fee
- [ ] Student account auto-created after acceptance fee
- [ ] Student can login with matric number
- [ ] Student sees welcome notification
- [ ] Student can upload documents
- [ ] Admin can verify documents
- [ ] Course registration enabled after verification
- [ ] School fees invoice generated
- [ ] Student can pay school fees
- [ ] Full portal access after payment

## Notes

1. **Matric Number is Username**: Students login with their matric number, not email
2. **Password Transfer**: Applicant's password is transferred to student account
3. **Automatic Conversion**: No manual admin action needed after acceptance fee payment
4. **Session Management**: Active session must exist for student operations
5. **Document Verification**: Can be done in parallel with course registration or required before

## Next Steps

1. ✅ Auto-convert applicant to student (DONE)
2. Create StudentDocument model and migration
3. Implement document upload API and UI
4. Create admin document verification
5. Implement course registration
6. Generate school fees invoices
7. Complete full portal features

---

**Last Updated**: November 28, 2025
**Status**: Step 8 (Auto-conversion) Complete ✅
**Next**: Implement Document Upload System
