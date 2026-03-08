# Reconnect Bank Account - Instructions

## Why You Need to Reconnect

The old payment method in your database was created before we fixed the Edge Function to properly attach payment methods to Stripe customers. The fix is now deployed, but the old payment method can't be used.

## Steps to Fix

### 1. Delete Old Payment Method (Optional but Recommended)

You can either:
- **Option A**: Refresh the page - the UI will clear
- **Option B**: Delete from database manually:

```sql
-- Find your payment method
SELECT id, payment_type, bank_name, last4, created_at 
FROM payment_methods 
WHERE user_id = 'YOUR_USER_ID';

-- Delete the old one
DELETE FROM payment_methods 
WHERE id = 'THE_OLD_PAYMENT_METHOD_ID';
```

### 2. Reconnect Bank Account

1. Go to Digital Wallet page
2. Click "Connect Bank Account" button
3. Use these **Stripe test credentials**:
   - **Account Holder Name**: Test User
   - **Institution Number**: 000
   - **Transit Number**: 11000
   - **Account Number**: 000123456789
   - **Bank Name**: (any name, e.g., "TD Bank")

4. Click "Connect Bank Account"
5. Wait for success message
6. Modal should close automatically

### 3. Make a Test Payment

1. Click "Make Payment" button
2. Enter amount: **0.50** (minimum test amount)
3. Click "Confirm Payment"
4. Check console for logs
5. Payment should process successfully!

## What Was Fixed

The Edge Function now:
1. Creates the payment method ✅
2. **Attaches it to the customer** ✅ (this was missing before)
3. Creates the SetupIntent with `confirm: true` ✅

## Expected Result

After reconnecting:
- Payment method will be properly attached to your Stripe customer
- You'll be able to make payments without the attachment error
- The payment will process through Stripe successfully

## Troubleshooting

If you still see errors after reconnecting:
1. Check Supabase Edge Function logs for the latest deployment
2. Verify the Edge Function was deployed with the fix
3. Check browser console for detailed error messages
4. Share the error logs with me

---

**Ready to test!** Just reconnect your bank account with the test credentials above.
