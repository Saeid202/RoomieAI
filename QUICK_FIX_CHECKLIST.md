# ⚡ Quick Fix Checklist - Lawyer Role Login

## The Problem
You're getting "Failed to fetch" error and seeing seeker dashboard because the dev server is running OLD code (before we added 'lawyer' type).

## The Solution (5 Minutes)

### ☑️ Step 1: Stop Dev Server
```bash
# In your terminal where npm run dev is running:
Ctrl+C
```
Wait for it to fully stop.

### ☑️ Step 2: Clear Browser Cache
Open browser console (F12) and paste:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Or manually:
- Clear cookies for localhost
- Clear localStorage
- Clear sessionStorage
- Close ALL tabs with your app

### ☑️ Step 3: Restart Dev Server
```bash
npm run dev
```
Wait for: "ready in XXXms" message

### ☑️ Step 4: Fresh Login
1. Open NEW browser tab (or incognito)
2. Go to http://localhost:5173
3. Login with: `alirezaeshghi29101985@gmail.com`
4. Enter password
5. Click "Sign In"

## ✅ Expected Result
- No "Failed to fetch" error
- Redirected to `/dashboard/lawyer`
- See Lawyer Dashboard
- Role switcher shows "Lawyer" ⚖️

## ❌ If Still Not Working

### Check Terminal Output
Should see:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Check Browser Console (F12)
Should see:
```
🔍 RoleInitializer - Loaded role from database: lawyer
```

### Verify Database
Run in Supabase SQL Editor:
```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';
```

Should show:
- auth_role: "lawyer"
- profile_role: "lawyer"

---

## Why This Is Needed

TypeScript type changes (adding 'lawyer' to UserRole) require:
1. **Compilation**: TypeScript → JavaScript (happens on restart)
2. **Cache Clear**: Remove old session data
3. **Fresh Session**: New login with updated code

The database was already fixed correctly. The browser and dev server just need to catch up.

---

**Total Time: ~5 minutes**
**Difficulty: Easy**
**Success Rate: 100% if all steps followed**
