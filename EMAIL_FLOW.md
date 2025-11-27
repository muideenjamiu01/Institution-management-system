# Email Notification Flow - Step by Step

## ✅ Fixed Issues
1. **SMTP Configuration**: Changed from manual host/port to `service: 'gmail'`
2. **Admission Approval Email**: Added email sending in `makeAdmissionDecision()` controller

## 📧 Email Triggers

### 1. Application Submission
**Status**: ❌ NOT IMPLEMENTED YET
**When**: Applicant submits application form
**File**: `backend/src/controllers/applicantProfileController.ts`
**Function**: `submitApplication()`
**Email**: Should send confirmation that application was received

### 2. Admission Approval
**Status**: ✅ IMPLEMENTED
**When**: Admin approves applicant's admission
**File**: `backend/src/controllers/admissionController.ts`
**Function**: `makeAdmissionDecision()` (line 218)
**Email Template**: `sendAdmissionApprovalEmail()` in `utils/email.ts`
**Content**:
- Congratulations message
- Matriculation number
- Next steps (pay acceptance fee)
- Link to applicant portal

### 3. Application Fee Payment
**Status**: ✅ IMPLEMENTED  
**When**: Applicant pays ₦20,000 application fee
**File**: `backend/src/controllers/applicantPaymentController.ts`
**Function**: `verifyPayment()` (line 274)
**Email**: Payment receipt with invoice details

### 4. Acceptance Fee Payment
**Status**: ✅ IMPLEMENTED
**When**: Approved applicant pays ₦50,000 acceptance fee  
**File**: `backend/src/controllers/applicantPaymentController.ts`
**Function**: `verifyPayment()` (line 321)
**Email**: Payment receipt with invoice details

### 5. Password Reset
**Status**: ✅ IMPLEMENTED
**When**: User requests password reset
**File**: Various auth controllers
**Email Template**: `sendPasswordResetEmail()` in `utils/email.ts`

## 🔧 Configuration Files

### `.env` (Backend)
```env
SMTP_USER="muideenjamiu01@gmail.com"
SMTP_PASSWORD="xtjv jwut xjsy heot"  # Gmail App Password
EMAIL_FROM="IMS <muideenjamiu01@gmail.com>"
APPLICANT_PORTAL_URL="http://localhost:3000"
STUDENT_PORTAL_URL="http://localhost:3001"
```

### Email Utility (`backend/src/utils/email.ts`)
- Uses `service: 'gmail'` for easy Gmail configuration
- Three email templates:
  1. `sendPasswordResetEmail()`
  2. `sendAdmissionApprovalEmail()`
  3. `sendPaymentReceiptEmail()`

## 🧪 Testing Emails Locally

Run the test script:
```bash
cd backend
npx ts-node src/test-email-simple.ts
```

This will:
1. Verify SMTP connection
2. Send test email to your Gmail
3. Show success/failure with message ID

## 📝 Current Flow

### Applicant Journey:
1. **Register** → No email (just account creation)
2. **Submit Application** → ❌ No email (should add)
3. **Pay Application Fee** → ✅ Payment receipt email
4. **Admin Reviews** → (internal process)
5. **Admin Approves** → ✅ Approval email with matric number
6. **Pay Acceptance Fee** → ✅ Payment receipt email
7. **Student Portal Access** → (future)

## 🐛 Known Issues & TODOs

1. **Missing**: Application submission confirmation email
   - **Fix**: Add email in `submitApplication()` function
   - **File**: `backend/src/controllers/applicantProfileController.ts`
   - **Line**: Around 358 after setting status to PENDING

2. **Email Link**: Approval email links to STUDENT_PORTAL_URL
   - **Fix**: Changed to APPLICANT_PORTAL_URL in email.ts

## 📂 Related Files

```
backend/
├── src/
│   ├── controllers/
│   │   ├── admissionController.ts          # Approval email ✅
│   │   ├── applicantPaymentController.ts   # Payment emails ✅
│   │   └── applicantProfileController.ts   # Application submission ❌
│   ├── utils/
│   │   └── email.ts                        # Email templates & sending
│   ├── test-email-simple.ts               # Test script
│   └── .env                                # SMTP configuration
```

## ✅ Verification Checklist

- [x] SMTP connection works
- [x] Test email sends successfully  
- [x] Approval email implemented
- [x] Payment receipt emails work
- [ ] Application submission email (TODO)
- [x] Email templates have correct URLs
- [x] Gmail App Password configured
