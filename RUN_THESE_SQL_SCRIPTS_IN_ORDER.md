# Run These SQL Scripts in Supabase - Step by Step

## Current Status
✅ Columns don't exist yet (check_broker_consent_column.sql returned no rows)
⏳ Need to create columns and set consent

## Step 1: Create the Columns (Run Migration)

**Copy and paste this entire script into Supabase SQL Editor:**

```sql
-- Migration: Add broker consent to mortgage profiles
-- File: supabase/migrations/20260223_add_broker_consent_to_mortgage_profiles.sql

-- Add broker_consent column (defaults to FALSE for privacy)
ALTER TABLE mortgage_profiles
ADD COLUMN IF NOT EXISTS broker_consent BOOLEAN DEFAULT FALSE;

-- Add broker_consent_date column (tracks when consent was given/changed)
ALTER TABLE mortgage_profiles
ADD COLUMN IF NOT EXISTS broker_consent_date TIMESTAMP WITH TIME ZONE;

-- Create index for efficient queries by brokers
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_broker_consent 
ON mortgage_profiles(broker_consent) 
WHERE broker_consent = TRUE;

-- Create trigger to automatically update broker_consent_date
CREATE OR REPLACE FUNCTION update_broker_consent_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.broker_consent IS DISTINCT FROM OLD.broker_consent THEN
        NEW.broker_consent_date = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_broker_consent_date ON mortgage_profiles;

CREATE TRIGGER trigger_update_broker_consent_date
    BEFORE UPDATE ON mortgage_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_broker_consent_date();

-- Add comment for documentation
COMMENT ON COLUMN mortgage_profiles.broker_consent IS 
'User consent to share profile with mortgage brokers. Defaults to FALSE for privacy.';

COMMENT ON COLUMN mortgage_profiles.broker_consent_date IS 
'Timestamp when broker_consent was last changed. Auto-updated by trigger.';
```

**Expected Result:** "Success. No rows returned" (this is good - it means the columns were created)

---

## Step 2: Verify Columns Were Created

**Run this to confirm:**

```sql
-- Check if broker_consent columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_profiles'
  AND column_name IN ('broker_consent', 'broker_consent_date')
ORDER BY column_name;
```

**Expected Result:** Should show 2 rows:
- `broker_consent` | boolean | YES | false
- `broker_consent_date` | timestamp with time zone | YES | NULL

---

## Step 3: Set Your Profile's Consent to TRUE

**Run this to enable consent for your test user:**

```sql
-- Set broker_consent to TRUE for your user
UPDATE mortgage_profiles
SET 
    broker_consent = TRUE,
    broker_consent_date = NOW()
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';

-- Verify the update
SELECT 
    id,
    user_id,
    full_name,
    email,
    broker_consent,
    broker_consent_date,
    created_at,
    updated_at
FROM mortgage_profiles
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';
```

**Expected Result:** Should show your profile with:
- `broker_consent` = true
- `broker_consent_date` = current timestamp

---

## Step 4: Verify What Brokers Will See

**Run this to see what the broker will see:**

```sql
-- This is what brokers see (profiles with consent = TRUE)
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone_number,
    credit_score_range,
    purchase_price_range,
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE broker_consent = TRUE
ORDER BY created_at DESC;
```

**Expected Result:** Should show your profile (1 row)

---

## Step 5: Test in the UI

### As Seeker:
1. Go to Dashboard → Buying Opportunities → Mortgage Profile
2. Hard refresh (Ctrl+Shift+R)
3. Scroll down to "Share with Mortgage Broker" checkbox
4. **It should be CHECKED** (because we set it to TRUE in the database)
5. Try unchecking it and saving
6. Verify it stays unchecked after save

### As Mortgage Broker:
1. Go to Dashboard → Clients
2. Hard refresh (Ctrl+Shift+R)
3. **You should see 1 client** (your seeker profile)
4. Should show name, email, phone, credit score, budget

### Test Revocation:
1. As seeker, uncheck the consent box
2. Click "Save Profile"
3. As broker, refresh the Clients page
4. **Should show 0 clients** (consent was revoked)

---

## Troubleshooting

### If checkbox doesn't stay checked:
- Hard refresh the page (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors

### If broker still sees 0 clients:
```sql
-- Check if your profile has consent
SELECT broker_consent, broker_consent_date 
FROM mortgage_profiles 
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';
```

### If consent is NULL or FALSE:
```sql
-- Set it to TRUE again
UPDATE mortgage_profiles
SET broker_consent = TRUE, broker_consent_date = NOW()
WHERE user_id = '025208b0-39d9-43db-94e0-c7ea91d8aca7';
```

---

## Summary

After running these scripts:
1. ✅ Columns created in database
2. ✅ Your profile has consent = TRUE
3. ✅ Broker can see your profile in Clients page
4. ✅ Checkbox shows checked state
5. ✅ You can toggle consent on/off
6. ✅ Broker only sees consented profiles

The privacy system is working correctly!
