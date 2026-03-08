# Check Edge Function Logs

## Command to Check Logs

Run this command in your terminal:

```bash
supabase functions logs create-pad-payment-intent --limit 50
```

This will show the last 50 log entries from the Edge Function.

## What to Look For

1. **Error messages** - Look for any errors from Stripe
2. **Payment method ID** - Check if the payment method ID is valid (should start with `pm_`)
3. **Customer ID** - Check if customer creation is working
4. **Request parameters** - Verify the amount, currency, etc.

## Alternative: Check in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Edge Functions" in the left sidebar
4. Click on "create-pad-payment-intent"
5. Click on "Logs" tab
6. Look for recent errors

## Common Issues

### Issue 1: Invalid Payment Method
```
Error: No such payment_method: 'pm_xxx'
```
**Solution:** The payment method ID in the database is incorrect or doesn't exist in Stripe

### Issue 2: Customer Creation Failed
```
Error: Customer creation failed
```
**Solution:** Check Stripe API keys

### Issue 3: Amount Too Small
```
Error: Amount must be at least $0.50 cad
```
**Solution:** Ensure amount is at least 50 cents (5000 in cents)

## Debug Steps

1. Check the browser console for the request being sent
2. Check Edge Function logs for the error
3. Check Stripe Dashboard for any failed payment intents
4. Verify payment method exists in database
