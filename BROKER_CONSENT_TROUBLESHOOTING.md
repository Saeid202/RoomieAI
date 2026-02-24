# Mortgage Broker Consent - Troubleshooting Guide

## Current Status
✅ Database migration completed (broker_consent and broker_consent_date columns added)
✅ TypeScript types updated with consent fields
✅ Service layer filtering by broker_consent = true
✅ UI checkbox with state management implemented
✅ Saeid Shabani's profile consent set to TRUE in database
⚠️ RLS policy may need to be verified/recreated
⚠️ Browser console errors need to be checked

## Issue
Mortgage broker (chinaplusgroup@gmail.com) sees "0 Clients" even though:
- Saeid Shabani (saeid.shabani64@gmail.com) has broker_consent = true
- The service correctly filters by broker_consent = true
- The checkbox state management looks correct

## Root Cause Analysis

### Possible Issues:
1. **RLS Policy Not Active**: The policy "Anyone can view profiles with broker consent" may not have been created successfully
2. **Browser Cache**: Old data cached in browser
3. **Console Errors**: JavaScript errors preventing the page from loading data

## Steps to Fix

### Step 1: Verify/Create RLS Policy
Run this SQL in Supabase SQL Editor:

```sql
-- Drop and recreate the policy
DROP POLICY IF EXISTS "Anyone can view profiles with broker consent" ON mortgage_profiles;

CREATE POLICY "Anyone can view profiles with broker consent"
ON mortgage_profiles
FOR SELECT
USING (broker_consent = TRUE);
```

### Step 2: Verify the Policy Works
Run this test query:

```sql
-- This should return Saeid's profile
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE broker_consent = true;
```

### Step 3: Clear Browser Cache
1. Open the mortgage broker's Clients page
2. Press **Ctrl + Shift + R** (hard refresh)
3. Or clear browser cache completely

### Step 4: Check Browser Console
1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Look for any red error messages
4. Share the error messages if any exist

## Code Verification

### Checkbox State Management (✅ Correct)
```typescript
// State declaration
const [brokerConsent, setBrokerConsent] = useState<boolean>(false);

// Sync with mortgageProfile when it loads
useEffect(() => {
    if (mortgageProfile) {
        setBrokerConsent(mortgageProfile.broker_consent || false);
    }
}, [mortgageProfile]);

// Form submission includes brokerConsent
const formData: MortgageProfileFormData = {
    // ... other fields
    broker_consent: brokerConsent,
};
```

### Service Layer (✅ Correct)
```typescript
export async function fetchAllMortgageProfiles(): Promise<MortgageProfile[]> {
  const { data, error } = await supabase
    .from('mortgage_profiles')
    .select('*')
    .eq('broker_consent', true)  // Only fetch consented profiles
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching mortgage profiles:", error);
    throw error;
  }

  return data || [];
}
```

## Expected Behavior After Fix

1. **Seeker Side (Saeid)**:
   - Checkbox shows as CHECKED when page loads
   - Checkbox state persists after save and page reload
   - Green badge shows "Your profile will be visible to our mortgage broker"

2. **Broker Side (chinaplusgroup)**:
   - Clients page shows "1 Client"
   - Saeid Shabani's card displays with:
     - Full name: Saeid Shabani
     - Email: saeid.shabani64@gmail.com
     - Phone: 4168825015
     - Any other filled profile data

## Test Checklist

- [ ] Run SQL to create/verify RLS policy
- [ ] Verify policy exists in pg_policies table
- [ ] Hard refresh broker's Clients page (Ctrl+Shift+R)
- [ ] Check browser console for errors
- [ ] Verify Saeid appears in clients list
- [ ] Test checkbox persistence on seeker side
- [ ] Test consent revocation (uncheck, save, verify broker sees 0 clients)

## Files Modified
- `supabase/migrations/20260223_add_broker_consent_to_mortgage_profiles.sql`
- `src/types/mortgage.ts`
- `src/services/mortgageBrokerService.ts`
- `src/pages/dashboard/BuyingOpportunities.tsx`
- `src/pages/dashboard/MortgageBrokerClients.tsx`
