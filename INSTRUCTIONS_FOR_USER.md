# 🔧 Fix Instructions: Mortgage Broker Can't See Clients

## Problem
Mortgage broker sees "0 Clients" even though Saeid Shabani has `broker_consent = true`.

## Root Cause
The RLS (Row Level Security) policy "Anyone can view profiles with broker consent" needs to be properly created alongside the existing user policy.

## Solution Steps

### Step 1: Run the SQL Fix
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `FINAL_BROKER_CONSENT_FIX.sql`
3. Click **Run**
4. Verify you see:
   - ✅ RLS is enabled (rowsecurity = true)
   - ✅ Two SELECT policies exist
   - ✅ Saeid's profile appears in the test query

### Step 2: Hard Refresh Broker's Page
1. Log in as mortgage broker (chinaplusgroup@gmail.com)
2. Go to **Clients** page
3. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
4. You should now see **"1 Client"** with Saeid Shabani's information

### Step 3: Check Browser Console (If Still Not Working)
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for any red error messages
4. Share the error messages with me

### Step 4: Test Checkbox Persistence (Seeker Side)
1. Log in as seeker (saeid.shabani64@gmail.com)
2. Go to **Buying Opportunities** → **Mortgage Profile** tab
3. Scroll to bottom - checkbox should be **CHECKED**
4. If unchecked, check it and click **Save Profile**
5. Refresh page (Ctrl + R) - checkbox should stay checked

## What the Fix Does

### Before Fix:
- Only one RLS policy: "Users can view their own mortgage profile"
- This policy only allows: `auth.uid() = user_id`
- Broker can't see OTHER users' profiles, even with consent

### After Fix:
- Two RLS policies (combined with OR logic):
  1. "Users can view their own mortgage profile" → `auth.uid() = user_id`
  2. "Anyone can view profiles with broker consent" → `broker_consent = TRUE`
- Now broker can see profiles where `broker_consent = true`

## Expected Results

### Broker's Clients Page:
```
Client Applications
1 Client

┌─────────────────────────────────────┐
│ Saeid Shabani                       │
│ 📧 saeid.shabani64@gmail.com        │
│ 📞 4168825015                       │
│ Credit Score: [if filled]           │
│ Budget: 300k_500k                   │
└─────────────────────────────────────┘
```

### Seeker's Mortgage Profile:
```
☑️ Share with Mortgage Broker
I consent to share my mortgage profile with Roomie AI's 
trusted mortgage broker for the purpose of mortgage review 
and recommendations.

✅ Your profile will be visible to our mortgage broker
   • Consented on 2/23/2026
```

## Troubleshooting

### If broker still sees 0 clients:
1. Verify SQL ran successfully (check Step 1 results)
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Check console for JavaScript errors

### If checkbox doesn't stay checked:
1. Make sure you clicked "Save Profile" button
2. Check for toast notification confirming save
3. Verify database has `broker_consent = true` (run verification SQL)

### If you see console errors:
Share the exact error message - it will help identify the issue.

## Files Involved
- ✅ Database: `mortgage_profiles` table with `broker_consent` column
- ✅ RLS Policies: Two SELECT policies on `mortgage_profiles`
- ✅ Service: `src/services/mortgageBrokerService.ts` (filters by consent)
- ✅ UI: `src/pages/dashboard/BuyingOpportunities.tsx` (checkbox)
- ✅ UI: `src/pages/dashboard/MortgageBrokerClients.tsx` (displays clients)

## Next Steps After Fix Works
1. Test consent revocation:
   - Seeker unchecks box → Save → Broker should see 0 clients
2. Test consent re-grant:
   - Seeker checks box → Save → Broker should see 1 client again
3. Test with multiple seekers:
   - Have another seeker fill mortgage profile with consent
   - Broker should see 2 clients
