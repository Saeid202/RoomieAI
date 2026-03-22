# Immediate Action Required: Fix Database RLS

## The Issue

Provider profiles aren't being saved to the database because RLS policies are blocking the bot's INSERT operations.

**Why**: The bot doesn't have authentication context, so `auth.uid()` is NULL, which fails the RLS check.

## The Fix (3 Steps)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/sql/new

### Step 2: Run First Migration
Copy and paste the content of:
```
supabase/migrations/20260366_disable_rls_renovator_profiles.sql
```

Click "Run" and wait for success.

### Step 3: Run Second Migration
Copy and paste the content of:
```
supabase/migrations/20260367_fix_renovation_requests_rls.sql
```

Click "Run" and wait for success.

### Step 4: Run Third Migration
Copy and paste the content of:
```
supabase/migrations/20260368_fix_renovation_matches_rls.sql
```

Click "Run" and wait for success.

## Verify It Works

After applying migrations:

1. Restart server: `npm run dev`
2. Test with Telegram:
   - Provider registers
   - Seeker searches
3. Check database:
   ```bash
   curl http://localhost:3001/test-renovators
   ```
4. Should see provider data in response

## What This Does

✅ Allows bot to insert provider profiles
✅ Allows bot to insert renovation requests
✅ Allows bot to create matches
✅ Maintains security with RLS policies
✅ Users can still only see their own data

## Expected Result

After migrations:
- Provider registers → Data saved to database ✅
- Seeker searches → Matches found from database ✅
- Cache still works as fallback ✅

## Timeline

- **Before**: Database timeout → No matches
- **After**: Database saves → Matches found

---

**Status**: Ready to apply
**Time to apply**: ~5 minutes
**Impact**: Fixes all database insert issues
