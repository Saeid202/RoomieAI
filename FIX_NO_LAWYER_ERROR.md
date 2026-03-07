# Fix: "No Platform Lawyer Available" Error

## Problem
You're getting an error when clicking "Add Lawyer" because there are no lawyers in the system yet.

## Quick Fix (2 minutes)

### Step 1: Check if lawyers exist
```sql
SELECT * FROM lawyer_profiles LIMIT 5;
```

If this returns **no rows**, you need to create a lawyer.

---

### Step 2: Create a Platform Lawyer

**Option A: Use an existing user account**

1. Find a user to make a lawyer:
```sql
SELECT id, email, raw_user_meta_data->>'full_name' as name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

2. Copy a user ID and run this (replace `YOUR_USER_ID_HERE`):
```sql
INSERT INTO lawyer_profiles (
  user_id,
  full_name,
  email,
  law_firm_name,
  practice_areas,
  years_of_experience,
  bio,
  city,
  province,
  is_accepting_clients
)
VALUES (
  'YOUR_USER_ID_HERE',  -- Paste user ID here
  'John Smith',
  'john.smith@lawfirm.com',
  'Smith & Partners LLP',
  ARRAY['Real Estate', 'Property Law'],
  10,
  'Experienced real estate lawyer specializing in property transactions',
  'Toronto',
  'ON',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name;
```

**Option B: Create a new test user + lawyer**

1. Sign up a new account in your app
2. Get the user ID:
```sql
SELECT id, email FROM auth.users 
WHERE email = 'your-new-lawyer@example.com';
```

3. Run the INSERT from Option A above

---

### Step 3: Verify
```sql
SELECT 
  id,
  full_name,
  email,
  law_firm_name
FROM lawyer_profiles;
```

Should show your lawyer!

---

### Step 4: Test Again
1. Refresh your app
2. Go to property → Secure Document Room
3. Click "Add Lawyer"
4. Should now show John Smith ✅

---

## What I Fixed

I updated the `AssignLawyerModal` to show a better error message when no lawyer exists:
- Before: Generic error
- After: "No platform lawyer available. Please contact support."

---

## For Production

In production, you'll want to:
1. Add a flag `is_platform_partner` to lawyer_profiles
2. Update `getPlatformLawyer()` to filter by this flag
3. Have a proper onboarding process for platform lawyers

For now, the first lawyer in the system will be used as the platform lawyer.

---

## Quick Commands

```sql
-- Check lawyers
SELECT * FROM lawyer_profiles;

-- Check users
SELECT id, email FROM auth.users LIMIT 10;

-- Delete test lawyer (if needed)
DELETE FROM lawyer_profiles WHERE email = 'john.smith@lawfirm.com';
```

