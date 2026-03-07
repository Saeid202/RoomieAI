# Application Withdrawal Troubleshooting Guide

## What Was Fixed

The system now properly deletes lease contracts when you withdraw or delete an application. Here's what happens:

### When You Withdraw an Application:
1. ✅ Deletes the lease contract from `lease_contracts` table
2. ✅ Deletes any application fees from `rental_payments` table  
3. ✅ Updates application status to 'withdrawn'
4. ✅ Removes the rent payment from Digital Wallet page

### When You Delete an Application:
1. ✅ Deletes the lease contract from `lease_contracts` table
2. ✅ Deletes any application fees from `rental_payments` table
3. ✅ Permanently deletes the application from database

## If You Still See the Price

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for these log messages when you withdraw:
   - `🔄 Withdrawing application: [id]`
   - `✅ Associated lease contract deleted`
   - `✅ Associated payments deleted`

### Step 2: Refresh the Digital Wallet Page
1. Go to Digital Wallet page
2. Click the new "Refresh" button in the top right
3. Check the console for:
   - `🔍 Fetching lease contracts for user: [id]`
   - `✅ No active lease found (expected after withdrawal)` ← This is what you should see!

### Step 3: Run Database Query
Run this SQL query in your Supabase SQL Editor:

```sql
-- Check if lease contracts still exist
SELECT 
  lc.id as lease_contract_id,
  lc.application_id,
  lc.monthly_rent,
  lc.status as lease_status,
  ra.status as application_status
FROM lease_contracts lc
LEFT JOIN rental_applications ra ON lc.application_id = ra.id
WHERE lc.tenant_id = auth.uid();
```

**Expected Result After Withdrawal:** 
- Should return 0 rows (no lease contracts)
- OR if application was only withdrawn (not deleted), the lease contract should be gone

### Step 4: Check for Multiple Lease Contracts
You might have multiple lease contracts. Run this:

```sql
SELECT COUNT(*) as total_lease_contracts
FROM lease_contracts
WHERE tenant_id = auth.uid();
```

If you see more than 1, you may have withdrawn one application but have another active lease.

## Common Issues

### Issue 1: Browser Cache
**Solution:** Hard refresh the page
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Issue 2: Multiple Applications
If you submitted multiple applications and only withdrew one, you'll still see rent payment for the other active lease.

**Check:** Go to "My Applications" and see how many applications you have.

### Issue 3: Database Permissions
The delete might have failed due to RLS policies.

**Check Console Logs:** Look for `⚠️ Could not delete lease contract:` error messages

## Manual Cleanup (If Needed)

If the lease contract is still there after withdrawal, run this SQL:

```sql
-- Find your withdrawn applications
SELECT id, status, property_id 
FROM rental_applications 
WHERE applicant_id = auth.uid() 
AND status = 'withdrawn';

-- Delete lease contracts for withdrawn applications
DELETE FROM lease_contracts
WHERE application_id IN (
  SELECT id FROM rental_applications 
  WHERE applicant_id = auth.uid() 
  AND status = 'withdrawn'
);
```

## Testing Steps

1. **Before Withdrawal:**
   - Go to Digital Wallet → Should see rent payment
   - Note the amount (e.g., $1,543.80)

2. **Withdraw Application:**
   - Go to My Applications
   - Click "Withdraw" on the application
   - Confirm the action
   - Wait for success message

3. **After Withdrawal:**
   - Go to Digital Wallet
   - Click "Refresh" button
   - Should see: "No active lease found. Please contact your landlord."
   - Rent payment should be gone

## What to Report

If it still doesn't work, please provide:
1. Screenshot of browser console logs
2. Result of the SQL query checking lease contracts
3. Number of applications you have (withdrawn vs active)
4. Any error messages you see

## Code Changes Made

### File: `src/pages/dashboard/MyApplications.tsx`
- Updated `withdraw()` function to delete lease contracts
- Updated `deleteApplication()` function to delete lease contracts
- Added better confirmation messages

### File: `src/pages/dashboard/tenant/TenantPayments.tsx`
- Added console logging for debugging
- Added "Refresh" button to manually reload lease data
- Better error messages when no lease is found
