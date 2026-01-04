# Payment Configuration System - Implementation Guide

## Overview
This document describes the comprehensive payment configuration system that allows administrators to control how students make payments for invoices.

## Features Implemented

### 1. **Partial Payment Control**
Administrators can configure whether students can pay invoices in installments or must pay in full.

**Fields:**
- `allowPartialPayment` (Boolean) - Enable/disable partial payments
- `minimumPayment` (Float, Optional) - Minimum amount per installment
- `maximumInstallments` (Integer, Optional) - Maximum number of installments allowed

**Use Cases:**
- School fees: Allow 3 installments with minimum ₦50,000 each
- Exam fees: Require full payment (no partial allowed)
- Development levy: Allow unlimited installments with ₦10,000 minimum

### 2. **Payment Deadline Enforcement**
Control whether payments can be made after the due date.

**Fields:**
- `enforceDeadline` (Boolean) - Block payments after due date
- `dueDate` (DateTime) - Payment deadline

**Use Cases:**
- Registration fees: Strict deadline enforcement
- School fees: Flexible deadline with late fees
- Optional fees: No deadline enforcement

### 3. **Late Fee Management**
Automatically apply charges for late payments.

**Fields:**
- `lateFeePercentage` (Float, Optional) - Percentage-based late fee (0-100%)
- `lateFeeAmount` (Float, Optional) - Fixed amount late fee

**Calculation Logic:**
- If `lateFeePercentage` is set: Late Fee = (Original Amount × Percentage) / 100
- If `lateFeeAmount` is set: Late Fee = Fixed Amount
- If both set: Only percentage is applied
- Late fees are calculated at payment initialization time

**Use Cases:**
- School fees: 5% late fee after deadline
- Departmental fees: ₦5,000 fixed late fee
- Technology fee: 10% late fee for late payments

## Database Schema

### Invoice Model Updates
```prisma
model Invoice {
  // ... existing fields ...
  
  // Payment Configuration Fields
  allowPartialPayment  Boolean       @default(true)
  minimumPayment       Float?
  maximumInstallments  Int?
  enforceDeadline      Boolean       @default(false)
  lateFeePercentage    Float?
  lateFeeAmount        Float?
  
  // ... relations ...
}
```

### Migration Applied
- Migration Name: `20260103223839_add_payment_configuration_fields`
- Status: ✅ Applied successfully
- Backward Compatible: Yes (all new fields are optional or have defaults)

## Backend Implementation

### 1. Invoice Creation (Admin)
**Endpoint:** `POST /api/admin/payments/invoices`

**New Request Body Fields:**
```json
{
  "type": "SCHOOL_FEE",
  "amount": 150000,
  "sessionId": 1,
  "allowPartialPayment": true,
  "minimumPayment": 50000,
  "maximumInstallments": 3,
  "enforceDeadline": false,
  "lateFeePercentage": 5,
  "lateFeeAmount": null,
  "dueDate": "2026-03-31T00:00:00Z"
}
```

**Controller:** `adminPaymentController.ts::createInvoices`
- Validates all payment configuration fields
- Creates invoices for selected students with configuration
- Sends notifications to affected students

### 2. Payment Initialization (Student)
**Endpoint:** `POST /api/student/payments/initialize`

**Enhanced Request Body:**
```json
{
  "invoiceId": 123,
  "method": "PAYSTACK",
  "amount": 60000  // Optional: for partial payment
}
```

**Validation Logic:**
1. **Partial Payment Validation:**
   - Check if `allowPartialPayment` is true
   - Verify amount meets `minimumPayment` requirement
   - Ensure amount doesn't exceed remaining balance
   - Check `maximumInstallments` limit not exceeded

2. **Deadline Validation:**
   - If `enforceDeadline` is true and deadline passed: Block payment
   - Otherwise: Allow payment but may apply late fees

3. **Late Fee Calculation:**
   - Check if current date > due date
   - Apply percentage or fixed late fee to payment amount
   - Include late fee in payment gateway initialization

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "pay_1234567890_abc123",
    "authorization_url": "https://checkout.paystack.com/xyz",
    "paymentId": 456,
    "amount": 63000,
    "lateFee": 3000
  }
}
```

## Frontend Implementation

### 1. Admin Invoice Creation Form
**Location:** `frontend/app/dashboard/payments/page.tsx`

**New UI Components:**

#### Payment Configuration Section
```tsx
<div className="border-t pt-4 mt-4">
  <h3 className="text-sm font-semibold mb-4">Payment Configuration</h3>
  
  {/* Toggle Switches */}
  <Switch 
    id="allowPartialPayment"
    label="Allow Partial Payment"
    description="Students can pay in installments"
  />
  
  {/* Conditional Fields */}
  {allowPartialPayment && (
    <>
      <Input label="Minimum Payment (₦)" />
      <Input label="Max Installments" />
    </>
  )}
  
  <Switch 
    id="enforceDeadline"
    label="Enforce Payment Deadline"
    description="Block payment after due date"
  />
  
  {/* Late Fee Options */}
  <Input label="Late Fee (%)" />
  <Input label="Late Fee Amount (₦)" />
</div>
```

**Form Validation:**
- Minimum payment cannot exceed total amount
- Maximum installments must be positive integer
- Late fee percentage must be between 0-100
- Both late fee fields are optional but mutually exclusive in calculation

### 2. Student Payment Interface
**Location:** `frontend/app/student/(portal)/payments/`

**Future Enhancement** (Not implemented yet):
- Show payment configuration details on invoice card
- Display minimum payment requirement
- Show remaining installments allowed
- Calculate and display potential late fees
- Add custom amount input for partial payments

## Use Case Examples

### Example 1: School Fees with Installment Plan
```json
{
  "type": "SCHOOL_FEE",
  "amount": 150000,
  "allowPartialPayment": true,
  "minimumPayment": 50000,
  "maximumInstallments": 3,
  "enforceDeadline": false,
  "lateFeePercentage": 5,
  "dueDate": "2026-03-31T00:00:00Z"
}
```

**Student Experience:**
- Can pay ₦50,000, ₦60,000, or ₦150,000 (any amount ≥ ₦50,000)
- Can make up to 3 separate payments
- No hard deadline, but 5% late fee applies after March 31
- If paying ₦50,000 after deadline: Total = ₦50,000 + (₦150,000 × 5%) = ₦57,500

### Example 2: Examination Fees (No Partial, Hard Deadline)
```json
{
  "type": "EXAMINATION_FEE",
  "amount": 25000,
  "allowPartialPayment": false,
  "enforceDeadline": true,
  "dueDate": "2026-02-15T00:00:00Z"
}
```

**Student Experience:**
- Must pay full ₦25,000 (partial payment rejected)
- Cannot pay after February 15 (hard deadline)
- No late fees (deadline enforced instead)

### Example 3: Departmental Fees with Fixed Late Fee
```json
{
  "type": "DEPARTMENTAL_FEE",
  "amount": 30000,
  "allowPartialPayment": true,
  "minimumPayment": 10000,
  "enforceDeadline": false,
  "lateFeeAmount": 5000,
  "dueDate": "2026-04-30T00:00:00Z"
}
```

**Student Experience:**
- Can pay ₦10,000, ₦15,000, ₦20,000, or ₦30,000
- Unlimited installments (no maximum set)
- Fixed ₦5,000 late fee after April 30
- If paying ₦10,000 after deadline: Total = ₦15,000

## Testing Checklist

### Backend Testing
- [ ] Create invoice with all configuration options
- [ ] Test partial payment validation (minimum amount)
- [ ] Test maximum installments enforcement
- [ ] Test deadline enforcement (should block payment)
- [ ] Test late fee percentage calculation
- [ ] Test late fee fixed amount calculation
- [ ] Test full payment when partial not allowed
- [ ] Test payment amount exceeding balance (should fail)

### Frontend Testing
- [ ] Form displays all payment configuration fields
- [ ] Conditional fields show/hide based on toggles
- [ ] Form validation prevents invalid values
- [ ] Success toast shows created invoice count
- [ ] Configuration persists after invoice creation

### Integration Testing
- [ ] Admin creates invoice with partial payment allowed
- [ ] Student sees minimum payment requirement
- [ ] Student attempts payment below minimum (should fail)
- [ ] Student makes partial payment (should succeed)
- [ ] Student attempts more than max installments (should fail)
- [ ] Student pays after deadline with late fee applied
- [ ] Late fee correctly calculated and charged

## Best Practices

### For Administrators

1. **School Fees:**
   - Enable partial payments with reasonable minimums
   - Set 2-3 installments maximum
   - Use percentage-based late fees (3-5%)
   - Don't enforce hard deadlines (allow flexibility with fees)

2. **Examination/Registration Fees:**
   - Disable partial payments (require full amount)
   - Enforce hard deadlines
   - No late fees (deadline is the control)

3. **Optional/Supplementary Fees:**
   - Enable partial payments with low minimums
   - No maximum installments limit
   - Flexible deadlines
   - Small fixed late fees

4. **Emergency/Special Fees:**
   - Disable partial payments
   - Short deadline with enforcement
   - No late fees (urgent nature)

### For Development

1. **Adding New Payment Types:**
   - Consider appropriate default configuration
   - Document expected payment behavior
   - Test with various student scenarios

2. **Modifying Configuration:**
   - Don't change configuration on existing invoices
   - Create new invoices with new settings
   - Provide migration path if needed

3. **Reporting:**
   - Track partial payment patterns
   - Monitor late fee collections
   - Identify deadline enforcement issues

## Future Enhancements

### Planned Features
1. **Payment Plans:** Pre-defined payment schedules
2. **Automatic Reminders:** Email/SMS before deadlines
3. **Grace Periods:** Buffer time before late fees apply
4. **Payment Locks:** Prevent payments during specific periods
5. **Refund Configuration:** Automatic or manual refund rules
6. **Discount Rules:** Early payment discounts
7. **Scholarship Integration:** Automatic payment adjustments
8. **Parent/Guardian Payments:** Third-party payment configuration

### API Enhancements
1. **Bulk Configuration Update:** Update multiple invoices at once
2. **Configuration Templates:** Save and reuse common settings
3. **Configuration History:** Track changes to payment rules
4. **Student Payment Simulation:** Preview payment options before creating invoice

## Troubleshooting

### Common Issues

**Issue:** Students can't make partial payments
- **Check:** `allowPartialPayment` field in database
- **Solution:** Update invoice with `allowPartialPayment = true`

**Issue:** Late fees not being applied
- **Check:** Due date is set and in the past
- **Check:** Either `lateFeePercentage` or `lateFeeAmount` is configured
- **Solution:** Ensure due date exists and late fee fields are properly set

**Issue:** Payment rejected at deadline
- **Check:** `enforceDeadline` field value
- **Solution:** If flexibility needed, set `enforceDeadline = false` and use late fees instead

**Issue:** Minimum payment validation failing
- **Check:** `minimumPayment` value vs payment amount
- **Solution:** Ensure minimum payment is reasonable (not > total amount)

## Support

For questions or issues:
- Backend errors: Check `ims-backend/logs/`
- Database issues: Review Prisma migration status
- Frontend issues: Check browser console
- Payment gateway: Review gateway logs and webhooks

## Conclusion

This payment configuration system provides flexible, fine-grained control over student payment behavior while maintaining data integrity and business rule enforcement. The system is designed to be intuitive for administrators and transparent for students, with clear validation messages and helpful error guidance.
