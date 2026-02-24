# How to Change a User's Role in the Database

## Overview
User roles are stored in two places:
1. **auth.users table** - In the `raw_user_meta_data` JSONB column
2. **user_profiles table** - In the `role` TEXT column

Both need to be updated for the role change to work properly.

## Available Roles
- `seeker` - Looking for roommates or rentals
- `landlord` - Property owners/managers
- `renovator` - Renovation professionals
- `mortgage_broker` - Mortgage brokers (NEW!)
- `admin` - System administrators

## Step-by-Step Guide

### Step 1: Find the User

Use `find_user_by_email.sql`:

```sql
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'role' as current_role_in_auth,
  up.role as current_role_in_profiles,
  up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'user@example.com';
```

**Copy the `user_id` from the results.**

### Step 2: Change the Role

Use `change_user_role.sql` and replace:
- `'user@example.com'` with the actual email
- `'mortgage_broker'` with the desired role

```sql
-- Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'user@example.com';

-- Update user_profiles table
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Step 3: Verify the Change

```sql
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'user@example.com';
```

Both `auth_role` and `profile_role` should now show the new role.

### Step 4: User Must Log Out and Log In

After changing the role in the database:
1. User must **log out** of the application
2. User must **log in** again
3. The new role will be loaded from the database
4. User will be redirected to the appropriate dashboard

## Quick Examples

### Change User to Mortgage Broker
```sql
-- By email
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'john@example.com';

UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = (SELECT id FROM auth.users WHERE email = 'john@example.com');
```

### Change User to Landlord
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"landlord"'::jsonb
)
WHERE email = 'jane@example.com';

UPDATE user_profiles
SET role = 'landlord'
WHERE id = (SELECT id FROM auth.users WHERE email = 'jane@example.com');
```

### Change User to Seeker
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"seeker"'::jsonb
)
WHERE email = 'bob@example.com';

UPDATE user_profiles
SET role = 'seeker'
WHERE id = (SELECT id FROM auth.users WHERE email = 'bob@example.com');
```

## Bulk Operations

### Change All "Lawyer" Users to "Mortgage Broker"
```sql
-- Update auth.users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE raw_user_meta_data->>'role' = 'lawyer';

-- Update user_profiles
UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE role = 'lawyer';

-- Verify
SELECT COUNT(*) FROM user_profiles WHERE role = 'mortgage_broker';
```

## Troubleshooting

### Issue: Role not updating in app
**Solution**: User must log out and log back in. The role is cached in the session.

### Issue: user_profiles record doesn't exist
**Solution**: Create the profile first:
```sql
INSERT INTO user_profiles (id, role, full_name, email)
SELECT 
  id, 
  'mortgage_broker',
  raw_user_meta_data->>'full_name',
  email
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Issue: Changes not persisting
**Solution**: Make sure you're running the SQL in the correct Supabase project and have proper permissions.

## Important Notes

1. **Both tables must be updated** - Updating only one table will cause inconsistencies
2. **User must re-login** - Changes won't take effect until the user logs out and back in
3. **Use transactions** - For bulk operations, wrap in BEGIN/COMMIT to ensure atomicity
4. **Backup first** - Always backup data before bulk operations
5. **Test on one user first** - Verify the process works before bulk changes

## Files Provided

1. `find_user_by_email.sql` - Find user information
2. `change_user_role.sql` - Change user role (single or bulk)
3. `list_all_users_with_roles.sql` - View all users and their roles
4. `HOW_TO_CHANGE_USER_ROLE.md` - This guide

## Where to Run These Scripts

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the SQL code
5. Replace placeholder values (email, user_id, role)
6. Click **Run**
7. Check the results

## Example Workflow

```sql
-- 1. Find the user
SELECT id, email, raw_user_meta_data->>'role' as current_role
FROM auth.users 
WHERE email = 'test@example.com';

-- 2. Change their role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"mortgage_broker"'::jsonb
)
WHERE email = 'test@example.com';

UPDATE user_profiles
SET role = 'mortgage_broker'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- 3. Verify the change
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  up.role as profile_role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'test@example.com';
```

Done! The user now has the new role and will see the appropriate dashboard after logging in again.
