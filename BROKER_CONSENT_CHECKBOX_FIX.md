# Broker Consent Checkbox Fix - Complete

## Problem
The broker consent checkbox in the mortgage profile form wasn't staying checked after the user clicked it. The checkbox would appear to check momentarily but then revert to unchecked state, even after saving and returning to the page.

## Root Cause
The checkbox was reading from `mortgageProfile?.broker_consent` but when the user clicked it, the state update wasn't properly reflected. The issues were:

1. Checkbox `checked` prop was bound to `mortgageProfile?.broker_consent`
2. `onCheckedChange` updated `mortgageProfile` state but this didn't trigger a re-render properly
3. Form submission was also reading from `mortgageProfile?.broker_consent` instead of tracking the checkbox state
4. Consent change detection logic was broken (comparing the same value to itself)
5. No useEffect to sync state when mortgageProfile loads or changes

## Solution Implemented

### 1. Added Local State for Broker Consent
```typescript
const [brokerConsent, setBrokerConsent] = useState<boolean>(false);
```

### 2. Initialize State When Profile Loads
In the `useEffect` that loads the mortgage profile:
```typescript
const profile = await fetchMortgageProfile(currentUserId);
setMortgageProfile(profile);

// Initialize broker consent state
setBrokerConsent(profile?.broker_consent || false);
```

### 3. Added Sync Effect for Profile Changes
```typescript
// Sync brokerConsent state with mortgageProfile whenever it changes
useEffect(() => {
    if (mortgageProfile) {
        setBrokerConsent(mortgageProfile.broker_consent || false);
    }
}, [mortgageProfile]);
```

### 4. Updated Checkbox to Use Local State
```typescript
<Checkbox
    id="broker_consent"
    checked={brokerConsent}
    onCheckedChange={(checked) => {
        setBrokerConsent(checked as boolean);
        toast({
            title: checked ? "Consent Given" : "Consent Revoked",
            description: "Remember to save your profile to apply this change.",
        });
    }}
    className="mt-1 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
/>
```

### 5. Fixed Form Submission
Updated `handleSubmitMortgageProfile` to:
- Use `brokerConsent` state instead of `mortgageProfile?.broker_consent`
- Fixed consent change detection logic:
```typescript
const previousConsent = mortgageProfile?.broker_consent || false;
const consentChanged = previousConsent !== brokerConsent;
const consentGiven = !previousConsent && brokerConsent;
const consentRevoked = previousConsent && !brokerConsent;
```

### 6. Updated Status Indicators
Changed status badges to use `brokerConsent` state:
```typescript
{brokerConsent && (
    <div className="...">Your profile will be visible to our mortgage broker</div>
)}
{!brokerConsent && (
    <div className="...">Your profile is private and not shared with brokers</div>
)}
```

### 7. Made Consent Text Bold
Changed text styling to `font-bold` and `text-gray-900` for better emphasis.

## Database Setup Required

### Step 1: Run the Migration
Run this in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20260223_add_broker_consent_to_mortgage_profiles.sql
-- (The migration file is already created)
```

### Step 2: Set Your Consent to True (if you already checked it)
Run this in Supabase SQL Editor:
```sql
-- File: set_broker_consent_true.sql
UPDATE mortgage_profiles
SET 
    broker_consent = TRUE,
    broker_consent_date = NOW()
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';
```

## User Experience Improvements

1. **Immediate Feedback**: Checkbox now stays checked/unchecked as expected
2. **Toast Notifications**: User gets immediate feedback when toggling consent
3. **Clear Status**: Status badge updates immediately to show current consent state
4. **Reminder to Save**: Toast reminds user to save the profile to persist the change
5. **Proper Persistence**: Consent state is saved to database when form is submitted
6. **State Sync**: Checkbox state syncs with database value on page load and profile changes
7. **Bold Text**: Consent text is now bold for better emphasis

## Testing Steps

1. **First, run the database migration and set consent SQL scripts in Supabase**
2. Navigate to Seeker Dashboard → Buying Opportunities → Mortgage Profile tab
3. Hard refresh the page (Ctrl+Shift+R) to clear cache
4. Verify checkbox is checked (if you ran the set_broker_consent_true.sql)
5. Verify green status badge appears
6. Uncheck the checkbox
7. Verify gray status badge appears
8. Check the checkbox again
9. Click "Save Profile" button
10. Verify success toast appears
11. Refresh the page (Ctrl+Shift+R for hard refresh)
12. Verify checkbox is still checked
13. Navigate away and come back
14. Verify checkbox persists

## Files Modified
- `src/pages/dashboard/BuyingOpportunities.tsx`

## SQL Files Created
- `check_broker_consent_column.sql` - Check if columns exist
- `set_broker_consent_true.sql` - Manually set consent to true

## Database Migration Required
- `supabase/migrations/20260223_add_broker_consent_to_mortgage_profiles.sql`

## Next Steps
1. Run the migration in Supabase SQL Editor
2. Run set_broker_consent_true.sql to set your consent
3. Hard refresh the page (Ctrl+Shift+R)
4. Test the checkbox functionality
5. Verify broker can only see consented profiles in their client list
6. Test consent revocation
7. Verify consent date is properly recorded
