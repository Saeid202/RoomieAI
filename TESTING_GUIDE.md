# 🧪 Testing Guide - Landlord Payment Functions

## Current Status
✅ **landlord-onboarding** - Redeployed with better error handling
⚠️ **landlord-payments** - May need debugging

## Test Steps

### 1. Clear Browser Cache
**IMPORTANT:** Hard refresh to clear cached 500 errors
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. Test Landlord Onboarding
1. Navigate to: `http://localhost:5173/dashboard/landlord/payments`
2. Open browser console (F12)
3. Click: **"Complete Payout Setup"**

**Expected Behavior:**
- ✅ No CORS errors
- ✅ Either redirects to Stripe OR shows specific error message
- ✅ Console shows JSON error (not `[object Object]`)

**Possible Errors & Solutions:**

#### Error: "Failed to create Stripe account"
**Cause:** Stripe API key issue
**Solution:** Verify `STRIPE_SECRET_KEY` is set correctly

#### Error: "Failed to save account" 
**Cause:** Database permission issue
**Solution:** Check RLS policies on `payment_accounts` table

#### Error: "Missing authorization header"
**Cause:** Not logged in
**Solution:** Log in as landlord first

### 3. Check Console for Detailed Errors
If you see a 500 error, the response should now include:
```json
{
  "error": "Specific error message",
  "details": "Detailed technical info"
}
```

**Please share:**
1. The exact error message from console
2. The "details" field content
3. Screenshot of Network tab showing the request/response

### 4. Test Landlord Payments List
The payments list might show a 500 error if:
- Table `rental_payments` doesn't exist
- Column names don't match
- RLS policies block access

**Debug Steps:**
1. Open Network tab
2. Look for request to `landlord-payments` function
3. Check the response body for error details

## Quick Fixes

### If "payment_accounts table doesn't exist"
Run this SQL:
```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'payment_accounts'
);
```

### If "rental_payments table doesn't exist"  
Run this SQL:
```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'rental_payments'
);
```

### If RLS blocks access
Run this SQL:
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('payment_accounts', 'rental_payments');
```

## Next Steps

**After testing, please provide:**
1. ✅ or ❌ for each test
2. Exact error messages from console
3. Any SQL query results if tables are missing

This will help me fix the remaining 500 errors!
