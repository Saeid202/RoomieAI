# Broker Feedback Error - FIXED ✅

## Problem Summary

When trying to send a message in the Broker Feedback interface, the following error occurred:
```
Error: Searched for a foreign key relationship between 'Auth is hoan_public' 
Could not find a relationship between 'mortgage_profile_feedback' and 'user_id'
```

## Root Cause

The `sender_id` column in `mortgage_profile_feedback` table was referencing `auth.users(id)`, but PostgREST (Supabase's API layer) cannot directly access the `auth` schema for security reasons. 

When the frontend tried to fetch sender information using:
```typescript
sender:sender_id (id, email, raw_user_meta_data)
```

PostgREST couldn't resolve this relationship because it can't access `auth.users`.

## Solution Applied

### 1. Database Fix (Run this SQL)
**File**: `FIX_SENDER_FOREIGN_KEY.sql`

Changed the foreign key relationship:
- **Before**: `sender_id` → `auth.users(id)` ❌
- **After**: `sender_id` → `user_profiles(id)` ✅

This works because:
- `user_profiles.id` is the same UUID as `auth.users.id`
- `user_profiles` is in the `public` schema (accessible to PostgREST)
- `user_profiles` contains the role and name data we need

### 2. Frontend Fix (Already Applied)
**File**: `src/services/mortgageFeedbackService.ts`

Updated the query to use `user_profiles` instead of trying to access `auth.users`:

```typescript
// Before
sender:sender_id (
  id,
  email,
  raw_user_meta_data
)

// After
sender:user_profiles!sender_id (
  id,
  full_name,
  email,
  role
)
```

## Steps to Deploy

1. **Run the SQL fix**:
   ```sql
   -- In Supabase SQL Editor, run:
   FIX_SENDER_FOREIGN_KEY.sql
   ```

2. **Verify the fix**:
   - The SQL will output the new foreign key relationship
   - Should show: `sender_id` → `user_profiles(id)`

3. **Test the feature**:
   - Refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
   - Try sending a message in the Broker Feedback tab
   - Should work without errors

## Why This Fix Works

1. **Correct Schema Access**: PostgREST can access `public.user_profiles`
2. **Same Data**: `user_profiles.id` = `auth.users.id` (same UUID)
3. **Better Data**: `user_profiles` has `full_name` and `role` directly (no need to parse `raw_user_meta_data`)
4. **Consistent**: RLS policies already use `user_profiles` for role checks

## Files Modified

- ✅ `FIX_SENDER_FOREIGN_KEY.sql` - Database migration (NEW)
- ✅ `src/services/mortgageFeedbackService.ts` - Frontend query (UPDATED)

## Testing Checklist

- [ ] Run `FIX_SENDER_FOREIGN_KEY.sql` in Supabase
- [ ] Refresh browser
- [ ] Send a message as a broker
- [ ] Send a message as a seeker
- [ ] Verify messages appear correctly
- [ ] Verify sender names display correctly
- [ ] Verify "Broker" badge shows for broker messages

## Additional Notes

This fix is actually an improvement over the original design because:
- Cleaner data access (no parsing of `raw_user_meta_data`)
- Better performance (no cross-schema joins)
- More maintainable (all user data in one place)
- Consistent with the rest of the application
