# Complete Flow Testing Guide

## Overview
This guide walks through testing the complete applicant-to-student journey, from initial registration to accessing the student portal.

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Database seeded with departments, programs, and sessions
- Payment gateway test keys configured (Paystack/Flutterwave)

---

## Test Flow: Applicant Registration → Student Portal Access

### Phase 1: Applicant Registration

#### Step 1.1: Create Account
1. Navigate to `http://localhost:3000/applicant/register`
2. Fill in registration form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe.test@example.com`
   - Phone: `08012345678`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
3. Click "Register"
4. **Expected Result**:
   - Username generated in format: `IMS2025-00XXX` (e.g., `IMS2025-00456`)
   - Success message displayed
   - Redirected to `/applicant/login`

#### Step 1.2: Login to Applicant Portal
1. Use credentials:
   - Username: `IMS2025-00XXX` (from registration)
   - Password: `SecurePass123!`
2. Click "Login"
3. **Expected Result**:
   - Logged in successfully
   - Redirected to `/applicant/dashboard`
   - Dashboard shows "Complete your application" banner

---

### Phase 2: Application Submission

#### Step 2.1: Complete Application Form
1. From dashboard, click "Complete Application" or navigate to `/applicant/application`
2. Fill in all required fields:
   - **Personal Information**:
     - Date of Birth: `1998-05-15`
     - Gender: `Male`
     - Address: `123 Test Street, Lagos`
     - State of Origin: `Lagos`
     - LGA: `Ikeja`
   - **Academic Information**:
     - Select Department: `Computer Science`
     - Select Program: `B.Sc Computer Science`
     - Previous Institution: `Test Secondary School`
     - Graduation Year: `2020`
   - **Contact Information**:
     - Next of Kin Name: `Jane Doe`
     - Next of Kin Phone: `08098765432`
     - Next of Kin Relationship: `Sister`
3. Click "Save Application"
4. **Expected Result**:
   - Application saved successfully
   - Dashboard now shows "Pay Application Fee" button
   - Application status: `DRAFT`

#### Step 2.2: Pay Application Fee (₦20,000)
1. From dashboard, click "Pay Application Fee"
2. Redirected to payment gateway (Paystack/Flutterwave)
3. Complete test payment:
   - For Paystack test: Use card `4084084084084081`, CVV `408`, Expiry `12/30`
   - Enter PIN: `0000`, OTP: `123456`
4. **Expected Result**:
   - Payment successful
   - Redirected back to applicant dashboard
   - Application status changed to: `PENDING`
   - Dashboard shows "Application Under Review" message
   - Application fee paid: ✅

---

### Phase 3: Admin Review & Approval

#### Step 3.1: Admin Login
1. Navigate to `http://localhost:3000/login`
2. Use admin credentials (from seed data):
   - Username: `admin`
   - Password: `admin123`
3. **Expected Result**:
   - Logged in as admin
   - Redirected to `/dashboard`

#### Step 3.2: View Applicant Details
1. From admin dashboard, navigate to `/dashboard/applicants`
2. Search for applicant: `john.doe.test@example.com` or `John Doe`
3. Click "View Details" on the applicant row
4. **Expected Result**:
   - Modal/page shows complete applicant information:
     - Personal details
     - Academic qualifications
     - Selected department and program
     - Application fee payment status (PAID)

#### Step 3.3: Approve Application
1. In applicant details view, click "Approve Application"
2. Confirm approval in dialog
3. **Expected Result**:
   - Application status changed to: `APPROVED`
   - Success notification displayed
   - Applicant list updated immediately (React Query refetch)

---

### Phase 4: Acceptance Fee Payment

#### Step 4.1: Applicant Sees Approval
1. Login back as applicant (or refresh dashboard if already logged in)
2. Navigate to `/applicant/dashboard`
3. **Expected Result**:
   - Green banner: "Congratulations! Application Approved"
   - Message: "Please pay your acceptance fee to secure your admission and receive your matriculation number"
   - "Pay Acceptance Fee" button visible

#### Step 4.2: Pay Acceptance Fee (₦50,000)
1. Click "Pay Acceptance Fee" button
2. Redirected to payment gateway
3. Complete test payment (same test card as before)
4. **⚠️ CRITICAL: This triggers automatic student account creation**
5. **Expected Result**:
   - Payment successful
   - Redirected to applicant dashboard
   - **Green card displays Matric Number**: `IMS/2025/XXX/00001` (format: IMS/Year/DeptCode/Sequence)
   - **Blue Alert displays**: "Your Student Portal is Ready!"
   - Alert shows:
     - Username: `IMS/2025/CVE/00001` (matric number)
     - Password: "Same as your applicant portal password"
     - Button: "Login to Student Portal"

---

### Phase 5: Student Portal Access (AUTOMATIC)

#### Step 5.1: Verify Student Account Created (Database Check)
**Backend automatic processes completed:**
1. ✅ Student record created in database
2. ✅ Matric number assigned and formatted
3. ✅ Password transferred from applicant account
4. ✅ Current level assigned based on program:
   - ND → 100
   - HND → 300
   - BSC/BA → 100
   - MSC/MA → 500
   - PHD → 700
5. ✅ Student status set to `ACTIVE`
6. ✅ Acceptance fee invoice created (PAID)
7. ✅ Payment record created in student payments
8. ✅ Welcome notification created

#### Step 5.2: Login to Student Portal
1. From applicant dashboard, click "Login to Student Portal" button
   - OR navigate directly to `http://localhost:3000/student/login`
2. **Blue info banner displays**: "New Students: Use your matric number (e.g., IMS/2025/CVE/00001) as username"
3. Enter credentials:
   - Username: `IMS/2025/CVE/00001` (your matric number)
   - Password: `SecurePass123!` (same password as applicant portal)
4. Click "Login"
5. **Expected Result**:
   - Logged in successfully
   - Redirected to `/student/dashboard`

#### Step 5.3: Verify Student Dashboard
**Dashboard Header:**
- Welcome message: "Welcome back, John!"
- Matric Number displayed: "Matric No: IMS/2025/CVE/00001"

**Welcome Banner (for new students):**
- Green background card
- Message: "Congratulations on Your Admission!"
- Matric number displayed prominently
- Quick action buttons:
  - "Register Courses"
  - "View Invoices"

**Statistics Grid:**
- Registered Courses: 0
- Pending Assignments: 0
- Current GPA: 0.00
- Wallet Balance: ₦0

**Account Information Card:**
- Matric Number: `IMS/2025/CVE/00001` (font-mono, bold)
- Email: `john.doe.test@example.com`
- Department: `Computer Science`
- Current Level: `100 Level` (auto-assigned)
- Programme: `B.Sc Computer Science`
- Status: `ACTIVE` (green badge)

**Navigation Menu:**
- Dashboard
- Courses
- Assignments
- Results
- Payments
- Profile
- Settings

---

## Phase 6: Verify Data Consistency

### Check 1: Database Records
```sql
-- Check applicant record
SELECT id, firstName, lastName, username, email, applicationStatus, 
       applicationFeePaid, acceptanceFeePaid, hasMatricNumber, matricNo
FROM Applicant
WHERE email = 'john.doe.test@example.com';

-- Check student record
SELECT id, firstName, lastName, username, matricNo, email, 
       currentLevel, status, acceptanceFeePaid
FROM Student
WHERE email = 'john.doe.test@example.com';

-- Check matric number record
SELECT * FROM MatricNumber
WHERE matricNo LIKE '%CVE%'
ORDER BY createdAt DESC
LIMIT 1;

-- Check student invoices
SELECT * FROM Invoice
WHERE studentId = (SELECT id FROM Student WHERE email = 'john.doe.test@example.com');

-- Check student payments
SELECT * FROM Payment
WHERE studentId = (SELECT id FROM Student WHERE email = 'john.doe.test@example.com');

-- Check notifications
SELECT * FROM Notification
WHERE studentId = (SELECT id FROM Student WHERE email = 'john.doe.test@example.com');
```

### Check 2: Expected Database Values
**Applicant:**
- `applicationStatus`: `APPROVED`
- `applicationFeePaid`: `true`
- `acceptanceFeePaid`: `true`
- `hasMatricNumber`: `true`
- `matricNo`: `IMS/2025/CVE/00001`

**Student:**
- `username`: Same as matric number
- `matricNo`: `IMS/2025/CVE/00001`
- `currentLevel`: `100` (for BSC program)
- `status`: `ACTIVE`
- `acceptanceFeePaid`: `true`
- `password`: Hashed version of `SecurePass123!`
- `departmentId`: Matches applicant's department
- `programId`: Matches applicant's program

**Invoice:**
- `type`: `ACCEPTANCE_FEE`
- `amount`: `50000.00`
- `status`: `PAID`
- `studentId`: Links to student record

**Payment:**
- `amount`: `50000.00`
- `paymentMethod`: `PAYSTACK` or `FLUTTERWAVE`
- `status`: `COMPLETED`
- `reference`: Unique payment reference from gateway

**Notification:**
- `type`: `ADMISSION`
- `title`: Contains "Welcome" or "Congratulations"
- `message`: Contains matric number
- `read`: `false` (unread)

---

## Phase 7: Test Edge Cases

### Test 7.1: Double Login Prevention
1. Login to applicant portal: `http://localhost:3000/applicant/login`
2. In another tab, try to login to student portal with same credentials
3. **Expected**: Both should work independently (different JWT tokens)

### Test 7.2: Password Consistency
1. Change password in applicant portal
2. Try to login to student portal with old password
3. **Expected**: Old password should still work (password transfer happened at conversion time)
4. If applicant changes password after conversion, it doesn't affect student account

### Test 7.3: Matric Number Uniqueness
1. Approve another applicant from same department
2. They pay acceptance fee
3. **Expected**: New matric number with incremented sequence (e.g., `IMS/2025/CVE/00002`)

### Test 7.4: Multiple Program Types
Test with different program types to verify level assignment:
- ND applicant → Student level: 100
- HND applicant → Student level: 300
- BSC applicant → Student level: 100
- MSC applicant → Student level: 500
- PHD applicant → Student level: 700

---

## Common Issues & Troubleshooting

### Issue 1: "Authorization URL not received"
**Cause**: Payment gateway configuration issue
**Solution**: Check `.env` file has correct test keys:
```env
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

### Issue 2: Student account not created after payment
**Cause**: Backend error during conversion process
**Solution**: 
1. Check backend logs: `npx ts-node src/server.ts`
2. Look for errors in `verifyPayment` function
3. Verify database relations are set up correctly
4. Run Prisma migration if needed: `npx prisma migrate dev`

### Issue 3: Matric number not displayed on applicant dashboard
**Cause**: Frontend not refreshing after payment
**Solution**: Click the refresh button on dashboard, or logout and login again

### Issue 4: Cannot login to student portal with matric number
**Cause**: Student record not created or matric number format issue
**Solution**:
1. Check database for student record
2. Verify matric number matches format: `IMS/YYYY/DEPT/XXXXX`
3. Check backend logs for student creation errors

### Issue 5: "Invalid credentials" on student login
**Cause**: Password transfer didn't work
**Solution**: Use password reset flow, or manually update student password in database

---

## Success Criteria Checklist

### ✅ Applicant Phase
- [ ] Can register new applicant with IMS2025-XXXXX username
- [ ] Can complete application form and save
- [ ] Can pay application fee via payment gateway
- [ ] Application status changes to PENDING after payment

### ✅ Admin Phase
- [ ] Admin can view all pending applicants
- [ ] Admin can search applicants by name/email
- [ ] Admin can view applicant details
- [ ] Admin can approve application
- [ ] Approval triggers real-time status update

### ✅ Conversion Phase
- [ ] Approved applicant sees "Pay Acceptance Fee" button
- [ ] Acceptance fee payment redirects to gateway
- [ ] Payment success triggers automatic student creation
- [ ] Matric number generated in IMS/YYYY/DEPT/XXXXX format
- [ ] Student record created with correct level
- [ ] Password transferred from applicant to student
- [ ] Acceptance fee invoice created as PAID
- [ ] Payment record created in student table
- [ ] Welcome notification created

### ✅ Student Portal Phase
- [ ] Matric number displayed on applicant dashboard
- [ ] "Login to Student Portal" button appears
- [ ] Student login page shows matric number guidance
- [ ] Can login with matric number and same password
- [ ] Student dashboard displays welcome banner
- [ ] Account information card shows all details
- [ ] Matric number displayed in header and cards
- [ ] Navigation menu accessible
- [ ] Stats show initial zeros (0 courses, 0 assignments)

### ✅ Data Integrity
- [ ] Applicant record updated with matricNo and flags
- [ ] Student record matches applicant details
- [ ] MatricNumber record created and linked
- [ ] Invoice created with PAID status
- [ ] Payment record matches transaction
- [ ] Notification created for student
- [ ] Department and program IDs match
- [ ] Email addresses consistent across records

---

## Next Steps After Testing

Once all tests pass:

1. **Document Upload System** (Priority 1)
   - Students upload O'Level results, passport photo, birth certificate
   - Admin verifies documents
   - Course registration enabled only after document approval

2. **Course Registration** (Priority 2)
   - List available courses for student's level
   - Register courses with credit unit validation
   - Generate course registration slip

3. **School Fees Management** (Priority 3)
   - Auto-generate school fees invoice after course registration
   - Process school fees payment
   - Generate payment receipt

4. **Full Portal Features** (Priority 4)
   - Assignment submission system
   - Results viewing and transcript
   - Timetable display
   - Student ID card generation

---

## Test Report Template

```markdown
# Test Report: Applicant to Student Flow

**Date**: [Date]
**Tester**: [Your Name]
**Environment**: Development

## Test Results

| Phase | Test Case | Status | Notes |
|-------|-----------|--------|-------|
| 1.1 | Applicant Registration | ✅ PASS | Username: IMS2025-00456 |
| 1.2 | Applicant Login | ✅ PASS | |
| 2.1 | Application Form | ✅ PASS | |
| 2.2 | Application Fee Payment | ✅ PASS | Reference: PAY123 |
| 3.1 | Admin Login | ✅ PASS | |
| 3.2 | View Applicant | ✅ PASS | |
| 3.3 | Approve Application | ✅ PASS | |
| 4.1 | Applicant Sees Approval | ✅ PASS | |
| 4.2 | Acceptance Fee Payment | ✅ PASS | Matric: IMS/2025/CVE/00001 |
| 5.2 | Student Portal Login | ✅ PASS | |
| 5.3 | Student Dashboard | ✅ PASS | All info displayed |

## Issues Found
1. [None / List any issues]

## Recommendations
1. [Any suggestions for improvements]

## Conclusion
✅ All tests passed successfully. Flow is production-ready.
```

---

## Performance Benchmarks

Expected response times:
- Applicant registration: < 2s
- Application form save: < 1s
- Payment initialization: < 3s
- Admin approval: < 1s
- Student account creation (automatic): < 5s
- Student portal login: < 2s
- Dashboard load: < 2s

Monitor backend logs for slow queries or errors during testing.
