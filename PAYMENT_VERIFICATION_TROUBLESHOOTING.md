# Student Payment Verification Troubleshooting Guide

## Issue: Payments Showing as Pending

If student payments are not being verified automatically and remain in PENDING status, follow these steps:

### 1. Check Payment Gateway Configuration

**For Paystack:**
```bash
# In your .env file
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # Test key starts with sk_test_
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx  # Test key starts with pk_test_
```

**For Flutterwave:**
```bash
# In your .env file
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx  # Test key has TEST in it
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
```

### 2. Manual Payment Verification

If automatic verification fails, you can manually verify payments:

**Using API:**
```bash
# Get the payment reference from the payment record
curl http://localhost:5000/api/webhooks/verify/paystack/REFERENCE_HERE

# Or for Flutterwave
curl http://localhost:5000/api/webhooks/verify/flutterwave/REFERENCE_HERE
```

**Using Admin Interface:**
Create a manual verification button in the admin dashboard.

### 3. Check Backend Logs

```bash
cd ims-backend
tail -f logs/combined.log
```

Look for:
- `[DEBUG] Verifying payment with...`
- `[DEBUG] Paystack response:` or `[DEBUG] Flutterwave response:`
- `[DEBUG] Payment verified as PAID` or verification errors

### 4. Common Issues

#### Issue: "Payment reference is required"
**Solution:** Ensure the redirect URL includes `reference` or `trxref` parameter.

#### Issue: "Invalid signature"
**Solution:** Check that your secret keys match between .env and payment gateway dashboard.

#### Issue: Gateway returns "Transaction not found"
**Solution:** 
- Payment might not have been completed at the gateway
- Check payment gateway dashboard for the transaction
- Verify the reference is correct

#### Issue: "Payment already processed"
**Solution:** Payment was already marked as PAID. Check database directly.

### 5. Test Payment Verification

For testing in development mode with test keys:

**Paystack Test Cards:**
```
Success: 4084084084084081
CVV: 408
PIN: 0000
OTP: 123456
```

**Flutterwave Test Cards:**
```
Success: 5531886652142950
CVV: 564
PIN: 3310
OTP: 12345
```

### 6. Database Direct Verification

If you need to manually mark a payment as verified in the database:

```sql
-- Find the payment
SELECT id, reference, status, amount FROM "Payment" 
WHERE reference = 'YOUR_REFERENCE_HERE';

-- Update payment status
UPDATE "Payment" 
SET status = 'PAID', "paidAt" = NOW(), "updatedAt" = NOW()
WHERE reference = 'YOUR_REFERENCE_HERE';

-- Update the related invoice
UPDATE "Invoice" 
SET "amountPaid" = "amountPaid" + PAYMENT_AMOUNT,
    balance = balance - PAYMENT_AMOUNT,
    status = CASE WHEN balance - PAYMENT_AMOUNT <= 0 THEN 'PAID' ELSE 'PARTIALLY_PAID' END,
    "updatedAt" = NOW()
WHERE id = INVOICE_ID;
```

### 7. Enable Test Mode Logging

Add this to your backend to see detailed payment verification logs:

```typescript
// In studentPaymentController.ts verifyPayment function
console.log('[DEBUG] Payment verification started');
console.log('[DEBUG] Reference:', paymentReference);
console.log('[DEBUG] Payment method:', payment.method);
console.log('[DEBUG] Gateway response:', gatewayResponse);
```

### 8. Webhook Configuration

Ensure webhooks are configured in your payment gateway dashboard:

**Paystack Webhook URL:**
```
https://yourdomain.com/api/webhooks/student/paystack
```

**Flutterwave Webhook URL:**
```
https://yourdomain.com/api/webhooks/student/flutterwave
```

### 9. Quick Fix Script

Run this script to verify all pending payments:

```bash
cd ims-backend
npx ts-node src/scripts/verifyPendingPayments.ts
```

### 10. Production Checklist

Before going live:
- [ ] Replace test keys with live keys
- [ ] Configure webhooks in payment gateway dashboard
- [ ] Test with small amount first
- [ ] Set up payment gateway IP whitelist if required
- [ ] Enable email notifications
- [ ] Set up monitoring and alerts

## Support

If issues persist:
1. Check backend logs: `ims-backend/logs/combined.log`
2. Check payment gateway dashboard for transaction status
3. Verify API keys are correct and active
4. Test with payment gateway's test cards first
5. Check network connectivity to payment gateway APIs
