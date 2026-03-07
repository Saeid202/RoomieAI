# SIMPLE FIX - Do This Right Now!

## The Problem
Your `user_profiles` record already exists but has `role = 'tenant'` instead of `role = 'lawyer'`.
We just need to UPDATE it, not INSERT a new one.

## THE FIX (Takes 2 Minutes!)

### Step 1: Update Database (30 seconds)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste this SQL:

```sql
UPDATE public.user_profiles
SET 
  role = 'lawyer'::user_role,
  updated_at = NOW()
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'alirezaeshghi29101985@gmail.com'
);
```

3. Click "Run"
4. You should see "Success. 1 rows affected."

### Step 2: Restart Dev Server (30 seconds)
In your terminal:
1. Press `Ctrl+C`
2. Type: `npm run dev`
3. Wait for "ready"

### Step 3: Clear Cache (30 seconds)
In browser console (F12):
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

### Step 4: Log Out and Log In (30 seconds)
1. Log out
2. Log in with: alirezaeshghi29101985@gmail.com

## Expected Result
✅ You'll see the Lawyer Dashboard
✅ URL will be `/dashboard/lawyer`
✅ Sidebar will show: Dashboard, Profile, Clients, Documents

## Why This Works
The error showed your `user_profiles` record exists but has:
- `role = 'tenant'` (wrong!)
- `full_name = null` (that's okay)

We're just updating the role field from 'tenant' to 'lawyer'.
No INSERT needed, just UPDATE!

---

**Total Time**: 2 minutes
**This WILL work!**
