# Profile Fields Analysis - UPDATED

## Issue Summary
The profile save is failing because the `user_profiles` table is missing the `user_type` column and many other fields that `SeekerProfile.tsx` is trying to save.

**Error:** `"Could not find the 'user_type' column of 'user_profiles' in the schema cache"`

## Root Cause
The `SeekerProfile.tsx` component (located at `src/pages/dashboard/SeekerProfile.tsx`) is trying to save 28+ fields to the `user_profiles` table, but the table only has 8 columns defined in the base schema.

## Current user_profiles Schema
The `user_profiles` table currently has only these columns:
- ✓ id (UUID)
- ✓ full_name (TEXT)
- ✓ email (TEXT)
- ✓ phone (TEXT)
- ✓ date_of_birth (DATE)
- ✓ occupation (TEXT)
- ✓ created_at (TIMESTAMPTZ)
- ✓ updated_at (TIMESTAMPTZ)

## Fields Being Sent by SeekerProfile.tsx (Line 200-230)
The component is trying to save these fields:
1. ✓ id
2. ✓ full_name
3. ✗ age (MISSING)
4. ✓ email
5. ✗ linkedin (MISSING)
6. ✗ nationality (MISSING)
7. ✗ about_me (MISSING)
8. ✗ gender (MISSING)
9. ✗ prefer_not_to_say (MISSING)
10. ✓ phone
11. ✗ profile_visibility (MISSING)
12. ✗ language (MISSING)
13. ✗ ethnicity (MISSING)
14. ✗ religion (MISSING)
15. ✓ occupation
16. ✗ preferred_location (MISSING)
17. ✗ budget_range (MISSING)
18. ✗ move_in_date_start (MISSING)
19. ✗ move_in_date_end (MISSING)
20. ✗ housing_type (MISSING)
21. ✗ work_location_legacy (MISSING)
22. ✗ pet_preference (MISSING)
23. ✗ diet (MISSING)
24. ✗ diet_other (MISSING)
25. ✗ hobbies (MISSING)
26. ✗ living_space (MISSING)
27. ✗ work_schedule (MISSING)
28. ✗ work_location (MISSING)
29. ✗ has_pets (MISSING)
30. ✗ pet_type (MISSING)
31. ✗ smoking (MISSING)
32. ✗ lives_with_smokers (MISSING)
33. ✗ user_type (MISSING - THIS IS THE ERROR)
34. ✓ updated_at

## Missing Columns (20 total)
The following columns need to be added to `user_profiles`:
1. **user_type** - TEXT (THE MAIN ERROR)
2. age - INTEGER
3. linkedin - TEXT
4. nationality - TEXT
5. about_me - TEXT
6. gender - TEXT
7. prefer_not_to_say - TEXT
8. profile_visibility - TEXT
9. language - TEXT
10. ethnicity - TEXT
11. religion - TEXT
12. preferred_location - TEXT
13. budget_range - TEXT
14. move_in_date_start - TEXT
15. move_in_date_end - TEXT
16. housing_type - TEXT
17. living_space - TEXT
18. work_location - TEXT
19. work_location_legacy - TEXT
20. work_schedule - TEXT
21. pet_preference - TEXT
22. has_pets - BOOLEAN
23. pet_type - TEXT
24. smoking - TEXT
25. lives_with_smokers - TEXT
26. diet - TEXT
27. diet_other - TEXT
28. hobbies - TEXT[]

## Solution

### Option 1: Apply the Migration (Recommended)
Run the migration file I created:
```sql
-- File: supabase/migrations/20250219_add_seeker_profile_columns.sql
```

You can apply this by:
1. Going to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `20250219_add_seeker_profile_columns.sql`
4. Run the query

### Option 2: Quick Fix (Fastest)
Run the updated `QUICK_FIX.sql` directly in Supabase SQL Editor. This will:
1. Add the `user_type` column (fixes the immediate error)
2. Add all other missing columns
3. Refresh the schema cache
4. Verify the fix

### Option 3: Manual SQL
If you prefer, you can run this minimal fix to just add the user_type column:

```sql
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'tenant';
NOTIFY pgrst, 'reload schema';
```

But you'll still need to add the other columns eventually.

## Important Notes

1. **Two Different Tables**: Your app uses TWO different profile tables:
   - `user_profiles` - Used by SeekerProfile.tsx (general user profile)
   - `roommate` - Used by the roommate matching system

2. **The Error**: The error specifically mentions `user_profiles` table, not `roommate`

3. **Schema Cache**: After adding columns, you MUST run `NOTIFY pgrst, 'reload schema';` to refresh the PostgREST cache

4. **Default Values**: The migration sets sensible defaults (e.g., `user_type` defaults to 'tenant')

## Verification

After running the fix, verify with:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'user_type';
```

You should see:
```
column_name | data_type
------------|----------
user_type   | text
```
