# Mortgage Broker Consent Feature - Implementation Plan

## Overview
Add a consent mechanism to the seeker's mortgage profile form that allows users to explicitly consent to sharing their mortgage profile with Roomie AI's trusted mortgage brokers.

## Concept
- **Privacy-First Approach**: Seekers control who can see their financial information
- **Explicit Consent**: Users must actively check a box to share their profile
- **Revocable**: Users can revoke consent at any time
- **Transparent**: Clear language about what data is shared and why

## Implementation Phases

### Phase 1: Database Schema Changes
**File**: Create new migration file `add_broker_consent_to_mortgage_profiles.sql`

```sql
-- Add consent column to mortgage_profiles table
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS broker_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS broker_consent_date TIMESTAMP WITH TIME ZONE;

-- Add index for broker queries
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_broker_consent 
ON mortgage_profiles(broker_consent) 
WHERE broker_consent = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN mortgage_profiles.broker_consent IS 'User consent to share profile with mortgage brokers';
COMMENT ON COLUMN mortgage_profiles.broker_consent_date IS 'Timestamp when consent was given or last updated';
```

### Phase 2: TypeScript Type Updates
**File**: `src/types/mortgage.ts`

Add to `MortgageProfile` interface:
```typescript
broker_consent?: boolean;
broker_consent_date?: string;
```

Add to `MortgageProfileFormData` interface:
```typescript
broker_consent?: boolean;
```

### Phase 3: UI Implementation
**File**: `src/pages/dashboard/BuyingOpportunities.tsx`

#### 3.1 Add Consent Checkbox to Form Schema
```typescript
const mortgageProfileSchema = z.object({
  // ... existing fields ...
  broker_consent: z.boolean().optional(),
});
```

#### 3.2 Add Consent UI Component (before Save button)
```tsx
{/* Broker Consent Section */}
<div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-purple-200">
  <div className="flex items-start gap-3">
    <Checkbox
      id="broker_consent"
      checked={formData.broker_consent || false}
      onCheckedChange={(checked) => 
        setFormData({ ...formData, broker_consent: checked as boolean })
      }
      className="mt-1"
    />
    <div className="flex-1">
      <Label 
        htmlFor="broker_consent" 
        className="text-sm font-semibold text-gray-900 cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <span>Share with Mortgage Broker</span>
        </div>
      </Label>
      <p className="text-sm text-gray-700 leading-relaxed">
        I consent to share my mortgage profile with Roomie AI's trusted mortgage broker 
        for the purpose of mortgage review and recommendations. You can revoke this 
        consent at any time.
      </p>
      {formData.broker_consent && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-700 font-medium">
          <CheckCircle className="h-4 w-4" />
          <span>Your profile will be visible to our mortgage broker</span>
        </div>
      )}
    </div>
  </div>
</div>
```

### Phase 4: Backend Service Updates
**File**: `src/services/mortgageBrokerService.ts`

Update `fetchAllMortgageProfiles` to filter by consent:
```typescript
export async function fetchAllMortgageProfiles(): Promise<MortgageProfile[]> {
  const { data, error } = await supabase
    .from('mortgage_profiles')
    .select('*')
    .eq('broker_consent', true)  // Only fetch profiles with consent
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mortgage profiles:', error);
    throw error;
  }

  return data || [];
}
```

### Phase 5: Save Logic Updates
**File**: `src/pages/dashboard/BuyingOpportunities.tsx`

Update the save handler to include consent and timestamp:
```typescript
const formData: MortgageProfileFormData = {
  // ... existing fields ...
  broker_consent: values.broker_consent || false,
};

// If consent is being given for the first time or changed
if (values.broker_consent && !mortgageProfile?.broker_consent) {
  // Consent timestamp will be set by database trigger or explicitly
  toast({
    title: "Consent Recorded",
    description: "Your profile will now be visible to our mortgage broker.",
  });
} else if (!values.broker_consent && mortgageProfile?.broker_consent) {
  // Consent revoked
  toast({
    title: "Consent Revoked",
    description: "Your profile is no longer visible to mortgage brokers.",
  });
}
```

### Phase 6: Database Trigger (Optional but Recommended)
**File**: Add to migration

```sql
-- Create function to update consent timestamp
CREATE OR REPLACE FUNCTION update_broker_consent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.broker_consent = TRUE AND (OLD.broker_consent IS NULL OR OLD.broker_consent = FALSE) THEN
    NEW.broker_consent_date = NOW();
  ELSIF NEW.broker_consent = FALSE THEN
    NEW.broker_consent_date = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_broker_consent_timestamp ON mortgage_profiles;
CREATE TRIGGER trigger_update_broker_consent_timestamp
  BEFORE UPDATE ON mortgage_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_consent_timestamp();
```

### Phase 7: Consent Status Display
Add a status indicator in the profile view:
```tsx
{mortgageProfile?.broker_consent && (
  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
    <div className="flex items-center gap-2 text-green-700">
      <CheckCircle className="h-5 w-5" />
      <div>
        <p className="font-semibold">Broker Access Enabled</p>
        <p className="text-sm">
          Consented on {new Date(mortgageProfile.broker_consent_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
)}
```

## Testing Checklist
- [ ] Database migration runs successfully
- [ ] Checkbox appears in mortgage profile form
- [ ] Consent can be checked and unchecked
- [ ] Profile saves with consent status
- [ ] Broker can only see profiles with consent = true
- [ ] Broker cannot see profiles with consent = false
- [ ] Consent timestamp is recorded correctly
- [ ] User can revoke consent
- [ ] Toast notifications work correctly
- [ ] UI styling matches organizational colors

## Privacy & Compliance Notes
1. **Clear Language**: The consent text clearly states what data is shared and for what purpose
2. **Revocable**: Users can change their mind at any time
3. **Timestamp**: We track when consent was given for audit purposes
4. **Default**: Consent defaults to FALSE (opt-in, not opt-out)
5. **Visibility**: Users can see their current consent status

## Future Enhancements
1. Email notification to user when broker views their profile
2. Consent history log
3. Ability to share with specific brokers only
4. Expiring consent (e.g., consent valid for 90 days)
5. Analytics on consent rates
