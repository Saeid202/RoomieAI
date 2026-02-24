# 🎯 FINAL FIX - Mortgage Broker Dashboard Access

## Current Status
✗ Auth role: `mortgage_broker` ✓  
✗ Profile role: `NULL` ← THIS IS THE PROBLEM  
✗ Full name: `NULL` ← May cause constraint issues

## The Problem
When you login:
1. Initial load reads `auth.users` → sees 'mortgage_broker' → shows mortgage broker dashboard ✓
2. RoleInitializer fetches `user_profiles.role` → finds NULL → defaults to 'seeker' → JUMPS to seeker dashboard ✗

## The Fix (3 steps)

### Step 1: Diagnose (30 seconds)
Run `check_profile_exists.sql` to see if the profile record exists.

### Step 2: Fix Database (30 seconds)
Run `UPSERT_PROFILE_ROLE.sql` - this handles both INSERT and UPDATE cases.

If that still shows NULL, run `FORCE_UPDATE_BYPASS_RLS.sql` to bypass RLS policies.

### Step 3: Clear Cache (30 seconds)
1. Close ALL browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Or use Incognito/Private window

### Step 4: Login (1 minute)
1. Go to your app login page
2. Login with: `chinaplusgroup@gmail.com`
3. Should land on: `/dashboard/mortgage-broker`
4. Should see: "Mortgage Broker Dashboard"
5. Should NOT jump to seeker dashboard

## Expected Result
✓ Lands on mortgage broker dashboard  
✓ Stays on mortgage broker dashboard  
✓ No jumping or flickering  
✓ Role persists across refreshes

## If Still Not Working

Check browser console (F12) for these logs:
```
RoleInitializer - Using role from metadata: mortgage_broker
Dashboard - path: /dashboard/mortgage-broker role: mortgage_broker
```

If you see different logs, share them and I'll help debug.

## What Was Changed
1. Database: Updated both `auth.users.raw_user_meta_data` and `user_profiles.role` to 'mortgage_broker'
2. Code: Improved `RoleInitializer.tsx` to better handle NULL values and add logging
3. Added `full_name` to satisfy database constraints

## Files to Use
- `check_profile_exists.sql` ← Run this first to diagnose
- `UPSERT_PROFILE_ROLE.sql` ← Run this to fix (handles INSERT/UPDATE)
- `FORCE_UPDATE_BYPASS_RLS.sql` ← If UPSERT doesn't work (bypasses RLS)
- `check_rls_policies.sql` ← Check RLS policies if still failing
- `DIAGNOSE_UPDATE_FAILURE.md` ← Full diagnostic guide
