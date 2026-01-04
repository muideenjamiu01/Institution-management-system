# Student Payment UI Enhancements

## Overview
Enhanced the student payment interface to fully support the payment configuration system, providing a transparent and user-friendly experience for partial payments, deadline management, and late fees.

## Key Enhancements

### 1. **Payment Configuration Display**
Students now see detailed payment rules directly on each invoice card:

- ✅ **Partial Payment Status**: Clear indicator whether installments are allowed
- ✅ **Minimum Payment**: Shows minimum amount required per installment
- ✅ **Maximum Installments**: Displays installment limit if configured
- ✅ **Full Payment Requirement**: Warning badge when partial payments not allowed
- ✅ **Overdue Status**: Red alert for invoices past due date
- ✅ **Late Fee Notice**: Shows percentage or fixed amount late fee
- ✅ **Payment Count**: Displays number of installments already made

**Example Display:**
```
ℹ️ Partial payments allowed (minimum: ₦50,000) - Max 3 installments
✓ 1 payment(s) made
⚠️ Payment overdue - 5% late fee applies
```

### 2. **Custom Payment Amount Input**
For invoices with partial payment enabled:

- **Input Field**: Enter custom payment amount
- **Placeholder**: Shows minimum payment requirement
- **Helper Text**: Displays full balance and minimum amount
- **Visual Summary**: Real-time display of amount to be charged
- **Late Fee Preview**: Shows calculated late fee before payment

**Validation:**
- Prevents amounts below minimum payment
- Prevents amounts exceeding balance
- Blocks partial payments when not allowed
- Validates installment limits

### 3. **Enhanced Payment Dialog**

**Before:**
- Simple method selection
- Fixed amount (full balance only)
- Basic error messages

**After:**
- Dynamic title and description based on configuration
- Optional custom amount input (conditional)
- Payment summary card showing:
  - Amount to pay (custom or full)
  - Late fees if applicable
  - Total charge preview
- Context-aware wallet button (checks custom amount)
- Comprehensive validation messages

### 4. **Backend Integration**

**Updated Endpoints:**
```typescript
POST /api/student/payments/initialize
{
  invoiceId: number,
  method: 'PAYSTACK' | 'FLUTTERWAVE',
  amount?: number  // Optional for partial payment
}
```

**Response Includes:**
```json
{
  "reference": "pay_123_abc",
  "authorization_url": "https://...",
  "amount": 53000,
  "lateFee": 3000
}
```

**Backend Validation:**
- Checks `allowPartialPayment` flag
- Validates against `minimumPayment`
- Enforces `maximumInstallments` limit
- Blocks payment if `enforceDeadline` and date passed
- Calculates and applies late fees automatically

## User Experience Flows

### Flow 1: Full Payment (Default)
1. Student views invoice with balance ₦150,000
2. Clicks "Make Payment"
3. Dialog shows: "Full payment of ₦150,000 required"
4. Selects payment method
5. Redirected to payment gateway

### Flow 2: Partial Payment (First Installment)
1. Student views invoice: "Partial payments allowed (minimum: ₦50,000)"
2. Clicks "Make Payment"
3. Dialog shows custom amount input
4. Enters ₦60,000
5. Summary shows: "Amount to pay: ₦60,000"
6. Selects payment method
7. Pays ₦60,000, balance becomes ₦90,000

### Flow 3: Partial Payment (Reaching Limit)
1. Student already made 2 payments (max 3 allowed)
2. Views invoice: "2 payment(s) made"
3. Enters ₦40,000 (still has ₦50,000 balance)
4. Error: "Maximum number of installments (3) reached. Full payment required."
5. Must pay remaining ₦50,000

### Flow 4: Late Payment with Fee
1. Invoice overdue: "Payment overdue - 5% late fee applies"
2. Clicks "Make Payment"
3. Dialog shows:
   - Amount to pay: ₦50,000
   - Late fee: 5% (₦7,500)
   - Total: ₦57,500
4. Proceeds to payment gateway with ₦57,500

### Flow 5: Deadline Enforced
1. Invoice past due date with `enforceDeadline: true`
2. Clicks "Make Payment"
3. Backend returns: "Payment deadline has passed. Please contact administration."
4. Payment blocked - must contact admin

## UI Components Added

### Alert Badges
```tsx
// Partial Payment Allowed
<Info className="h-4 w-4" />
"Partial payments allowed (minimum: ₦50,000)"

// Full Payment Required
<AlertCircle className="h-4 w-4 text-amber-600" />
"Full payment required"

// Overdue Alert
<AlertCircle className="h-4 w-4 text-red-600" />
"Payment overdue - 5% late fee applies"

// Payment Progress
<CheckCircle2 className="h-4 w-4" />
"2 payment(s) made"
```

### Custom Amount Input
```tsx
<Input
  type="number"
  placeholder="Min: ₦50,000"
  value={customAmount}
  onChange={(e) => setCustomAmount(e.target.value)}
/>
<p className="text-xs text-muted-foreground">
  Leave empty to pay full balance: ₦150,000 (Minimum: ₦50,000)
</p>
```

### Payment Summary Card
```tsx
<div className="bg-muted p-3 rounded-lg">
  <div className="flex justify-between">
    <span>Amount to pay:</span>
    <span className="font-semibold">₦60,000</span>
  </div>
  <div className="flex justify-between text-amber-600">
    <span>Late fee:</span>
    <span className="font-semibold">5% (₦7,500)</span>
  </div>
</div>
```

## Validation Messages

### Client-Side
- "Invalid Amount" - Non-numeric or negative value
- "Full Payment Required" - Partial not allowed
- "Amount Too Low" - Below minimum payment
- "Amount Too High" - Exceeds balance
- "Maximum installments reached" - Limit exceeded

### Server-Side
- "Partial payments are not allowed for this invoice"
- "Minimum payment amount is ₦50,000"
- "Payment amount cannot exceed remaining balance"
- "Maximum number of installments (3) reached"
- "Payment deadline has passed"

## Technical Implementation

### Type Definitions
```typescript
interface Invoice {
  // ... existing fields
  allowPartialPayment: boolean;
  minimumPayment: number | null;
  maximumInstallments: number | null;
  enforceDeadline: boolean;
  lateFeePercentage: number | null;
  lateFeeAmount: number | null;
  payments?: Array<{ status: string }>;
}
```

### State Management
```typescript
const [customAmount, setCustomAmount] = useState<string>('');

// Reset on dialog close
onOpenChange={(open) => {
  if (!open) {
    setCustomAmount('');
  }
}}
```

### API Integration
```typescript
// Frontend
paymentsApi.initializePayment(invoiceId, method, amount)

// Backend handles
- Validation of payment rules
- Late fee calculation
- Installment tracking
- Deadline enforcement
```

## Benefits

### For Students
1. **Transparency**: Clear understanding of payment rules
2. **Flexibility**: Can choose payment amount within limits
3. **Awareness**: See late fees before paying
4. **Progress**: Track installments made
5. **Guidance**: Helpful messages and constraints

### For Institution
1. **Compliance**: Automated rule enforcement
2. **Revenue**: Proper late fee collection
3. **Control**: Configurable payment policies
4. **Tracking**: Detailed installment history
5. **Flexibility**: Different rules per invoice type

## Testing Scenarios

### Test Case 1: Partial Payment Success
- ✅ Invoice allows partial: true, min: ₦50,000
- ✅ Student enters ₦60,000
- ✅ Payment succeeds
- ✅ Balance updated to ₦90,000

### Test Case 2: Below Minimum Rejection
- ✅ Invoice min: ₦50,000
- ✅ Student enters ₦40,000
- ✅ Error: "Minimum payment amount is ₦50,000"
- ✅ Payment blocked

### Test Case 3: Installment Limit
- ✅ Max 3 installments, 2 already made
- ✅ Student tries 3rd partial payment
- ✅ Error: "Maximum installments reached"
- ✅ Must pay full balance

### Test Case 4: Late Fee Applied
- ✅ Invoice overdue, 5% late fee
- ✅ Amount: ₦100,000
- ✅ Late fee: ₦5,000
- ✅ Total charged: ₦105,000

### Test Case 5: Deadline Enforced
- ✅ Invoice past due, enforceDeadline: true
- ✅ Payment attempt
- ✅ Error: "Payment deadline has passed"
- ✅ Payment blocked

## Future Enhancements

1. **Payment Plans**: Pre-scheduled installments
2. **Payment Calculator**: Show installment breakdown
3. **Deadline Countdown**: Days remaining timer
4. **Payment Reminders**: Email/SMS before due date
5. **Grace Period**: Buffer before late fees
6. **Payment History Graph**: Visual payment progress
7. **Mobile Optimization**: Enhanced mobile UX
8. **Payment Receipts**: Instant downloadable receipts

## Conclusion

The enhanced student payment UI provides a complete, transparent, and user-friendly experience that fully leverages the backend payment configuration system. Students can now easily understand payment requirements, make informed decisions about installment amounts, and see exactly what they'll be charged before proceeding to payment gateways.
