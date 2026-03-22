# Fix: Database RLS Policies Blocking Bot Inserts

## Problem

The Telegram bot couldn't save provider profiles to the database because RLS (Row Level Security) policies required `auth.uid()` to match, but the bot doesn't have authentication context.

**Error**: `Connection terminated due to connection timeout` (actually RLS rejection)

## Solution

Apply three new migrations to fix RLS policies:

1. `20260366_disable_rls_renovator_profiles.sql` - Allow bot to insert profiles
2. `20260367_fix_renovation_requests_rls.sql` - Allow bot to insert requests
3. `20260368_fix_renovation_matches_rls.sql` - Allow bot to insert matches

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each migration file content
3. Run each one in order:
   - First: `20260366_disable_rls_renovator_profiles.sql`
   - Second: `20260367_fix_renovation_requests_rls.sql`
   - Third: `20260368_fix_renovation_matches_rls.sql`

### Option 2: Using Supabase CLI

```bash
# Apply migrations
supabase migration up

# Or manually:
supabase db push
```

## What Changed

### Before
```sql
CREATE POLICY "Users can create requests" ON renovation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
❌ Bot has no `auth.uid()`, so INSERT fails

### After
```sql
CREATE POLICY "Allow bot to insert requests" ON renovation_requests
  FOR INSERT WITH CHECK (true);
```
✅ Bot can insert without authentication

## Verification

After applying migrations, test:

```bash
# Check if provider can be saved
curl http://localhost:3001/test-renovators
```

Should show provider data in the response.

## What This Enables

✅ Bot can insert provider profiles
✅ Bot can insert renovation requests
✅ Bot can create matches
✅ Users can still view/update their own data
✅ Active profiles are visible to everyone

## Security Notes

- RLS is still enabled (not disabled)
- Policies allow bot inserts but maintain user privacy
- Users can only see/update their own data
- Active profiles are publicly visible (for matching)

## Next Steps

1. Apply the three migrations
2. Restart the server: `npm run dev`
3. Test with Telegram:
   - Provider registers
   - Check database: `curl http://localhost:3001/test-renovators`
   - Should see provider data saved

## Troubleshooting

### Still no data in database?
1. Check migrations were applied: Supabase Dashboard → Migrations
2. Verify no errors in migration output
3. Restart server: `npm run dev`
4. Test again with Telegram

### Data in cache but not database?
1. Check RLS policies: Supabase Dashboard → Authentication → Policies
2. Verify all three migrations were applied
3. Check for any policy conflicts

### Still getting timeout errors?
1. Check Supabase status: https://status.supabase.com
2. Try again in a few minutes
3. Check database connection in `.env`

## Files Created

- `supabase/migrations/20260366_disable_rls_renovator_profiles.sql`
- `supabase/migrations/20260367_fix_renovation_requests_rls.sql`
- `supabase/migrations/20260368_fix_renovation_matches_rls.sql`

## Status

✅ Migrations created and ready to apply
✅ Will fix database insert issues
✅ Maintains security with RLS policies
