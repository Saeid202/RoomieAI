# Fix Lawyer Role Redirect Issue - Complete Instructions

## Problem
You login and briefly see the lawyer dashboard, then get redirected to seeker dashboard.

## Root Cause
The code fixes have been applied (LoginDialog and RoleInitializer now fetch role from database), but:
1. Dev server hasn't recompiled the TypeScript changes
2. Browser has stale cached data in localStorage/sessionStorage

## Solution - Follow These Steps IN ORDER

### Step 1: Stop Dev Server
In your terminal where `npm run dev` is running:
- Press `Ctrl+C` to stop the server

### Step 2: Clear Browser Cache
Open your browser console (F12) and run these commands:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Or manually:
- Open DevTools (F12)
- Go to Application tab
- Click "Clear storage" on the left
- Check all boxes
- Click "Clear site data"

### Step 3: Restart Dev Server
In your terminal:
```bash
npm run dev
```

Wait for the message "Local: http://localhost:5173/" (or similar)

### Step 4: Login Again
1. Go to http://localhost:5173
2. Click Login
3. Enter your credentials:
   - Email: alirezaeshghi29101985@gmail.com
   - Password: (your password)
4. You should be redirected DIRECTLY to `/dashboard/lawyer`

## What Was Fixed

### Database (Already Done ✅)
- `auth.users.raw_user_meta_data.role` = "lawyer"
- `user_profiles.role` = "lawyer"  
- `lawyer_profiles` record exists

### React Code (Already Done ✅)
- `RoleContext.tsx` - Added 'lawyer' to UserRole type
- `RoleSwitcher.tsx` - Added lawyer option
- `RoleSelectionDialog.tsx` - Added lawyer option
- `SignupForm.tsx` - Added lawyer registration
- `RoleInitializer.tsx` - Fetches role from DATABASE (not metadata)
- `LoginDialog.tsx` - Fetches role from DATABASE (not metadata)

## Expected Behavior After Fix
1. Login with your credentials
2. System fetches role from database → "lawyer"
3. Redirects to `/dashboard/lawyer`
4. No redirect to seeker dashboard
5. Lawyer sidebar shows with correct menu items

## If Still Not Working
Run this in browser console after login to debug:
```javascript
console.log("LocalStorage role:", localStorage.getItem('userRole'));
console.log("SessionStorage:", sessionStorage);
```

Then check the Network tab for the database query to `user_profiles` table.
