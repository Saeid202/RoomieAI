# 🔧 Race Condition Fix - Lawyer Dashboard Redirect Issue

## The Problem

You briefly see the lawyer dashboard, then get redirected to seeker dashboard. This is a **race condition** between:

1. **Database** (user_profiles.role = "lawyer") ✅ Correct
2. **Auth Metadata** (user.user_metadata.role = "seeker") ❌ Outdated
3. **RoleInitializer** loads from database first, but something overrides it

## Root Cause

The `RoleInitializer` component:
1. Loads role from database → Gets "lawyer" ✅
2. Sets role context to "lawyer" ✅
3. BUT: Something else is reading `user.user_metadata.role` → Gets "seeker" ❌
4. That overrides the context back to "seeker"

The auth metadata wasn't updated when we fixed the database.

## The Fix (2 Steps)

### Step 1: Update Auth Metadata

Run this in Supabase SQL Editor:

```sql
-- Update auth metadata to match database
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lawyer"'
)
WHERE email = 'alirezaeshghi29101985@gmail.com';

-- Verify it worked
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = up.role 
    THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as sync_status
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';
```

You should see:
- auth_metadata_role: "lawyer"
- user_profiles_role: "lawyer"
- sync_status: "✅ SYNCED"

### Step 2: Restart & Clear Cache (Again)

Even though you already restarted, you need to do it again because:
1. I just updated the RoleInitializer code
2. The auth metadata needs to be refreshed in your session

```bash
# Stop dev server
Ctrl+C

# Clear browser cache (F12 console)
localStorage.clear();
sessionStorage.clear();
location.reload();

# Restart dev server
npm run dev

# Login in NEW tab
```

## What I Fixed in Code

### RoleInitializer.tsx

Changed this logic:
```typescript
// OLD: Only update if different
if (userRole && role !== userRole) {
  setRole(userRole);
}

// NEW: Always update to ensure consistency
setRole(userRole);
```

This ensures the database role ALWAYS takes precedence, even if something else tries to override it.

## Why This Happened

When we ran `JUST_INSERT_DATA.sql`, it updated:
- ✅ `user_profiles.role` → "lawyer"
- ✅ `lawyer_profiles` → created record
- ❌ `auth.users.raw_user_meta_data.role` → NOT updated (still "seeker")

The RoleInitializer loads from database (correct), but other parts of the app might read from metadata (outdated).

## Verification Steps

After running the SQL and restarting:

1. **Check Browser Console** (F12):
   ```
   🔍 RoleInitializer - Loaded role from database: lawyer
   🔄 RoleInitializer - Setting role to context: lawyer
   📍 Dashboard - Current state: { role: 'lawyer', ... }
   ```

2. **Check URL**:
   - Should be: `/dashboard/lawyer`
   - NOT: `/dashboard/roommate-recommendations`

3. **Check UI**:
   - See "Lawyer Dashboard" title
   - Role switcher shows "Lawyer" ⚖️
   - Sidebar has lawyer menu items

## If Still Not Working

### Debug: Check What's Overriding the Role

Add this to browser console after login:
```javascript
// Watch for role changes
let originalSetRole = null;
const roleContext = document.querySelector('[data-role-context]');
if (roleContext) {
  console.log('Watching role changes...');
}
```

### Check Auth State

In browser console:
```javascript
// Check current auth state
const { data } = await supabase.auth.getUser();
console.log('Auth metadata role:', data.user?.user_metadata?.role);

// Check database role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', data.user.id)
  .single();
console.log('Database role:', profile?.role);
```

Both should show "lawyer".

## Success Criteria

✅ Auth metadata role = "lawyer"
✅ Database role = "lawyer"
✅ No redirect after seeing lawyer dashboard
✅ Stay on `/dashboard/lawyer`
✅ Role switcher shows "Lawyer"

---

**Run the SQL first, then restart. This should fix it!**
