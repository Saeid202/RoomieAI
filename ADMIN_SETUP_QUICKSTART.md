# Quick Start: Admin Separation Setup

## ✅ Implementation Complete!

All code has been implemented. Follow these steps to set up your first admin user:

## Step 1: Create Your Admin Account

1. Start your dev server if not running:
   ```powershell
   npm run dev
   ```

2. Go to http://localhost:5173/auth

3. Sign up with your admin email (e.g., `admin@roomieai.com`)

4. Remember your password!

## Step 2: Grant Admin Access in Database

1. Open Supabase Dashboard: https://supabase.com/dashboard

2. Go to your project: **bjesofgfbuyzjamyliys**

3. Click **SQL Editor** in the sidebar

4. Run this query to find your user ID:
   ```sql
   SELECT id, email FROM auth.users 
   WHERE email = 'YOUR_EMAIL_HERE';
   ```

5. Copy the `id` (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

6. Run this query to make yourself admin:
   ```sql
   INSERT INTO public.user_roles (user_id, role, assigned_by)
   VALUES ('YOUR_USER_ID_HERE', 'admin', 'SYSTEM');
   ```

## Step 3: Login as Admin

1. Go to http://localhost:5173/admin/login

2. Enter your admin credentials

3. Click "Login as Administrator"

4. You should be redirected to `/dashboard/admin` 🎉

## Verify Everything Works

### Test 1: Admin Can Access Everything
- ✅ You should see "Administrator" in the role switcher
- ✅ You can access `/dashboard/admin`
- ✅ You can switch to Seeker or Landlord roles
- ✅ You can switch back to Admin role

### Test 2: Regular Users Cannot Access Admin
1. Logout
2. Create a new account at `/auth` (use different email)
3. Login with the new account
4. ✅ Should NOT see "Administrator" in role switcher
5. ✅ Should only see "Seeker" and "Landlord" options
6. Try to access `/dashboard/admin` directly
7. ✅ Should be redirected to `/dashboard` with "Access Denied" message

### Test 3: Separate Admin Login Works
1. Logout
2. Go to `/admin/login`
3. Try to login with non-admin account
4. ✅ Should show "Access Denied" and sign you out
5. Login with admin account
6. ✅ Should successfully login and go to admin dashboard

## What Changed?

### New Files Created:
1. ✅ `src/services/adminService.ts` - Admin verification logic
2. ✅ `src/components/AdminRoute.tsx` - Protected route component
3. ✅ `src/pages/admin/AdminLogin.tsx` - Separate admin login page
4. ✅ `supabase/migrations/setup_admin_users.sql` - Setup instructions
5. ✅ `ADMIN_SEPARATION_SYSTEM.md` - Full documentation

### Files Updated:
1. ✅ `src/components/dashboard/RoleSwitcher.tsx` - Hides admin for non-admins
2. ✅ `src/components/auth/RoleSelectionDialog.tsx` - Hides admin option
3. ✅ `src/App.tsx` - Protected admin routes

## Routes

### For Everyone:
- `/` - Home
- `/auth` - Regular login
- `/admin/login` - Admin login

### For Logged-in Users:
- `/dashboard` - User dashboard
- All other dashboard routes

### For Admins Only:
- `/dashboard/admin` - Admin home
- `/dashboard/admin/pages` - CMS pages
- `/dashboard/admin/users` - User management
- `/dashboard/admin/renovation-partners` - Partners
- `/dashboard/admin/cleaners` - Cleaners
- `/dashboard/admin/settings` - Settings

## Security Features

✅ **Database-level verification** - Admin status stored in `user_roles` table  
✅ **Route protection** - All admin routes check admin status  
✅ **UI hiding** - Non-admins cannot see admin options  
✅ **Separate login** - Dedicated admin login page  
✅ **Auto sign-out** - Non-admins signed out if they try admin login  
✅ **Caching** - 5-minute cache for performance  

## Need Help?

### Admin option not showing?
- Verify you inserted the role into `user_roles` table
- Refresh the page
- Check browser console for errors

### Can't access admin routes?
- Make sure you're logged in as admin
- Check `user_roles` table has your entry
- Try clearing cache and re-logging in

### "Access Denied" message?
- You're not an admin
- Double-check the user ID in database matches your account
- Role might be spelled incorrectly (must be exactly 'admin')

## Next Steps

1. ✅ Test the admin login at `/admin/login`
2. ✅ Verify regular users can't access admin
3. ✅ Add more admins as needed (repeat Step 2 for other emails)
4. 🎉 Your admin system is secure and ready to use!

## Questions?

See full documentation in `ADMIN_SEPARATION_SYSTEM.md`
