# Broker Feedback Error Investigation Plan

## Error Summary
When trying to send a message in the Broker Feedback interface, the following error occurs:
```
Error: Searched for a foreign key relationship between 'Auth is hoan_public' out neither were found. Hint: null; Message: Could not find a relationship between 'mortgage_pr_ile_feedback' and 'user_id' in the schema cache
```

## Key Observations

1. **Typo in Error Message**: The error shows `mortgage_pr_ile_feedback` (missing 'of') - this might be a display issue or actual table name problem
2. **Column Reference Issue**: Error mentions `user_id` but `user_profiles` table uses `id` as primary key
3. **Foreign Key Relationship**: The system is looking for a relationship that doesn't exist or is misconfigured

## Investigation Steps

### Step 1: Verify Table Structure
Run `INVESTIGATE_BROKER_FEEDBACK_ISSUE.sql` to check:
- ✓ Does `mortgage_profile_feedback` table exist?
- ✓ What are its columns and foreign keys?
- ✓ What is the structure of `user_profiles` table?
- ✓ What is the primary key of `user_profiles`?

### Step 2: Check RLS Policies
Run `DIAGNOSE_EXACT_ERROR.sql` to examine:
- ✓ Exact text of all RLS policies on `mortgage_profile_feedback`
- ✓ Are policies referencing `user_profiles.user_id` (wrong) or `user_profiles.id` (correct)?
- ✓ Are there any cached/old policy definitions?

### Step 3: Check Triggers and Functions
- ✓ Examine `update_profile_review_status()` function source code
- ✓ Check if trigger is referencing wrong columns
- ✓ Verify trigger is properly attached to table

### Step 4: Check Foreign Key Constraints
- ✓ Verify `sender_id` foreign key points to correct table/column
- ✓ Check if there are multiple conflicting foreign keys
- ✓ Ensure foreign key references `auth.users(id)` not `user_profiles`

## Potential Root Causes

### Hypothesis 1: Cached Old Policy Definitions
The RLS policies might have been updated in the migration file, but Supabase is still using cached versions with the old `user_profiles.user_id` reference.

**Solution**: Drop and recreate all policies

### Hypothesis 2: Wrong Foreign Key Target
The `sender_id` column might be pointing to `user_profiles` instead of `auth.users`, causing confusion in the relationship chain.

**Solution**: Verify and fix foreign key constraints

### Hypothesis 3: Trigger Function Has Wrong Column Reference
The `update_profile_review_status()` function might still reference `user_profiles.user_id`.

**Solution**: Update function definition

### Hypothesis 4: Frontend Sending Wrong Data
The frontend might be sending data that doesn't match the expected schema.

**Solution**: Check what data is being sent in the INSERT statement

## Expected Database Schema

### Correct Structure:
```sql
-- user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,  -- This IS the user_id (references auth.users.id)
    role TEXT,
    -- other columns
);

-- mortgage_profile_feedback table
CREATE TABLE mortgage_profile_feedback (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES mortgage_profiles(id),
    sender_id UUID REFERENCES auth.users(id),  -- NOT user_profiles!
    message TEXT,
    -- other columns
);
```

### Correct RLS Policy Pattern:
```sql
-- Check if user is a broker
EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid()  -- NOT user_profiles.user_id
    AND user_profiles.role = 'mortgage_broker'
)
```

## Next Steps

1. **Run Investigation Queries**: Execute both SQL files to gather data
2. **Analyze Results**: Review the output to identify the exact issue
3. **Create Targeted Fix**: Based on findings, create a precise fix
4. **Test Fix**: Verify the fix resolves the issue
5. **Document Solution**: Record what was wrong and how it was fixed

## Questions to Answer

- [ ] Does `user_profiles` have a `user_id` column? (It shouldn't)
- [ ] Are RLS policies using `user_profiles.id` or `user_profiles.user_id`?
- [ ] Is the trigger function using correct column references?
- [ ] Are foreign keys pointing to the right tables?
- [ ] Is there a schema cache issue in Supabase?
