# Role System Architecture Explained

## The Problem: Two Sources of Truth

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLE STORAGE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │  user_profiles       │      │  auth.users          │   │
│  │  (Database Table)    │      │  (Auth System)       │   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │ id                   │      │ id                   │   │
│  │ email                │      │ email                │   │
│  │ role: "landlord"     │  ✗   │ raw_user_meta_data:  │   │
│  │ full_name            │      │   {role:"landlord"}  │   │
│  │ created_at           │      │ created_at           │   │
│  └──────────────────────┘      └──────────────────────┘   │
│           ↑                              ↑                  │
│           │                              │                  │
│           │  NOT SYNCED!                 │                  │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            │                              │
            │                              │ THIS IS WHAT
            │ You changed this             │ THE APP READS!
            │ to "mortgage_broker"         │ Still shows
            │                              │ "landlord"
            ↓                              ↓
```

## What Happens When You Login

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email/password                              │
│           ↓                                                  │
│  2. Supabase Auth validates credentials                     │
│           ↓                                                  │
│  3. Auth returns user object with metadata                  │
│           ↓                                                  │
│  4. user.user_metadata.role = "landlord" ← FROM AUTH!       │
│           ↓                                                  │
│  5. RoleInitializer sets role to "landlord"                 │
│           ↓                                                  │
│  6. Dashboard shows Landlord Dashboard                      │
│           ↓                                                  │
│  7. user_profiles.role = "mortgage_broker" ← IGNORED!       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## The Solution: Sync Both Places

```
┌─────────────────────────────────────────────────────────────┐
│                    FIXED SYSTEM                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │  user_profiles       │      │  auth.users          │   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │ role:                │  ✓   │ raw_user_meta_data:  │   │
│  │ "mortgage_broker"    │ SYNC │ {role:               │   │
│  │                      │ ═══► │  "mortgage_broker"}  │   │
│  └──────────────────────┘      └──────────────────────┘   │
│           ↑                              ↑                  │
│           │                              │                  │
│           │  BOTH UPDATED!               │                  │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            │                              │
            │ SQL updates this             │ SQL updates this
            │ UPDATE user_profiles         │ UPDATE auth.users
            │ SET role = ...               │ SET raw_user_meta_data
            │                              │ = jsonb_set(...)
            ↓                              ↓
```

## New Login Flow (Fixed)

```
┌─────────────────────────────────────────────────────────────┐
│                    FIXED LOGIN FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email/password                              │
│           ↓                                                  │
│  2. Supabase Auth validates credentials                     │
│           ↓                                                  │
│  3. Auth returns user object with metadata                  │
│           ↓                                                  │
│  4. user.user_metadata.role = "mortgage_broker" ✓           │
│           ↓                                                  │
│  5. RoleInitializer sets role to "mortgage_broker"          │
│           ↓                                                  │
│  6. Dashboard shows Mortgage Broker Dashboard ✓             │
│           ↓                                                  │
│  7. user_profiles.role = "mortgage_broker" ✓ SYNCED!        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Enhanced RoleInitializer (Fallback Protection)

```
┌─────────────────────────────────────────────────────────────┐
│              ROLE LOADING WITH FALLBACK                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Check user.user_metadata.role                           │
│           ↓                                                  │
│  2. Role found in metadata?                                 │
│      ├─ YES → Use it ✓                                      │
│      │                                                       │
│      └─ NO → Fetch from user_profiles table ✓               │
│                ↓                                             │
│           3. Query database for role                        │
│                ↓                                             │
│           4. Use database role as fallback                  │
│                                                              │
│  This ensures role changes work even if metadata            │
│  isn't synced immediately!                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Why This Matters

### Before Fix
- ❌ Change role in database → Nothing happens
- ❌ User still sees old dashboard
- ❌ Must log out and back in (sometimes doesn't work)
- ❌ Confusing for users

### After Fix
- ✅ Change role with SQL script → Updates both places
- ✅ User refreshes page → Sees new dashboard
- ✅ No logout required
- ✅ Fallback protection if metadata missing
- ✅ Clear and predictable behavior

## Key Takeaway

**Always update BOTH places when changing a user's role:**
1. `user_profiles.role` (for database queries)
2. `auth.users.raw_user_meta_data` (for authentication system)

Use the provided SQL scripts to ensure both are updated together!
