# Testing Landlord Payout Setup

## Error Encountered
```
Error setting up bank account: Error: Failed to setup payout method: Function error: {"name":"FunctionsHttpError","context":{}}
```

## Troubleshooting Steps

### 1. Check if Edge Function is Deployed
Run this command to see deployed functions:
```bash
npx supabase functions list
```

### 2. Deploy the Function
If not deployed, run:
```bash
npx supabase functions deploy setup-landlord-payout
```

### 3. Check Function Logs
View real-time logs:
```bash
npx supabase functions logs setup-landlord-payout
```

Or check in Supabase Dashboard:
- Go to https://supabase.com/dashboard
- Select your project
- Go to Edge Functions
- Click on `setup-landlord-payout`
- View logs

### 4. Verify Environment Variables
Make sure these are set in Supabase Dashboard → Project Settings → Edge Functions:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` for test mode)
- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_ANON_KEY` - Auto-set by Supabase

### 5. Test with Correct Data Format

The function expects this format:
```json
{
  "methodType": "bank_account",
  "bankAccount": {
    "accountHolderName": "Test User",
    "institutionNumber": "000",
    "transitNumber": "00000",
    "accountNumber": "000123456789",
    "accountType": "checking",
    "bankName": "TD Canada Trust"
  }
}
```

### 6. Common Issues

**Issue**: Function not deployed
**Solution**: Deploy using `npx supabase functions deploy setup-landlord-payout`

**Issue**: Missing STRIPE_SECRET_KEY
**Solution**: Add it in Supabase Dashboard → Project Settings → Edge Functions → Secrets

**Issue**: Stripe API error
**Solution**: Check Stripe Dashboard logs at https://dashboard.stripe.com/test/logs

**Issue**: Database permission error
**Solution**: Check RLS policies on `payment_accounts` table

### 7. Quick Fix - Redeploy Function

Run these commands:
```bash
# Make sure you're in the project root
cd /path/to/your/project

# Deploy the function
npx supabase functions deploy setup-landlord-payout --no-verify-jwt

# Check if it's running
npx supabase functions list
```

### 8. Alternative: Check Browser Console

Open browser DevTools (F12) and check:
1. Network tab - look for the failed request to see the actual error
2. Console tab - look for any JavaScript errors

The actual error message should be visible in the Network tab response.
