# Deploy Payment Method Fix

## Issue
Payment confirmation was failing because the payment method wasn't properly attached to the Stripe customer.

## Fix Applied
Updated `supabase/functions/create-pad-payment-method/index.ts` to:
1. Attach the payment method to the customer before creating SetupIntent
2. Auto-confirm the SetupIntent for instant verification

## Deploy Command

Run this command in your terminal:

```bash
supabase functions deploy create-pad-payment-method
```

## After Deployment

1. **Reconnect your bank account:**
   - Go to Digital Wallet page
   - If you have an existing payment method, you may need to delete it first (we can add a delete button if needed)
   - Click "Connect Bank Account"
   - Enter test credentials:
     - Account Holder: Test User
     - Institution: 000
     - Transit: 11000
     - Account: 000123456789
   - Click "Connect Bank Account"

2. **Make a test payment:**
   - Enter amount (e.g., $10.00)
   - Click "Confirm Payment"
   - Check console for detailed logs

## What Changed

### Before:
```typescript
// Create payment method
const paymentMethod = await stripe.paymentMethods.create({...});

// Create SetupIntent (payment method not attached to customer)
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  payment_method: paymentMethod.id,
  ...
});
```

### After:
```typescript
// Create payment method
const paymentMethod = await stripe.paymentMethods.create({...});

// Attach payment method to customer FIRST
await stripe.paymentMethods.attach(paymentMethod.id, {
  customer: customerId,
});

// Then create SetupIntent with auto-confirm
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  payment_method: paymentMethod.id,
  confirm: true, // Auto-confirm
  ...
});
```

## Why This Fixes It

Stripe requires payment methods to be attached to a customer before they can be used in payment intents. Without this attachment:
- The payment method exists but isn't linked to the customer
- When creating a payment intent, Stripe can't find the payment method for that customer
- Result: "No such payment_method" error

With the attachment:
- Payment method is properly linked to the customer
- Payment intents can use the payment method
- Payments work correctly

## Testing Checklist

- [ ] Deploy Edge Function
- [ ] Reconnect bank account
- [ ] Verify bank account appears in UI
- [ ] Make test payment ($10.00)
- [ ] Check console logs for success
- [ ] Verify payment appears in Stripe Dashboard
- [ ] Check Supabase database for payment record
