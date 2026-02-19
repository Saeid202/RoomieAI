# RoomieAI Platform Architecture

## User Authentication & Role System

### How It Works

Your platform uses a **SINGLE AUTH TABLE + ROLE-BASED SYSTEM** architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    auth.users (Supabase Auth)               │
│  - All users (tenants, landlords, renovators) sign up here │
│  - Managed by Supabase Authentication                       │
│  - Contains: id, email, password (encrypted)                │
│  - raw_user_meta_data: { role: 'tenant'|'landlord'|etc }   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    (Trigger on signup)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              public.user_profiles (Main Profile)            │
│  - One profile per user (all roles)                         │
│  - Contains: id, full_name, email, role, phone, etc.        │
│  - role: 'seeker' | 'landlord' | 'renovator'                │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    (Based on role/feature)
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                     ↓                      ↓
┌──────────────┐    ┌──────────────────┐   ┌──────────────────┐
│   roommate   │    │landlord_         │   │ renovator_       │
│   (seekers)  │    │verifications     │   │ verifications    │
│              │    │                  │   │                  │
│ Extended     │    │ KYC/License      │   │ License/Certs    │
│ profile for  │    │ verification     │   │ verification     │
│ roommate     │    │ for landlords    │   │ for renovators   │
│ matching     │    │                  │   │                  │
└──────────────┘    └──────────────────┘   └──────────────────┘
```

## Table Breakdown

### 1. `auth.users` (Supabase Managed)
- **Purpose**: Authentication for ALL users
- **Who**: Everyone (tenants, landlords, renovators)
- **Contains**: 
  - id (UUID)
  - email
  - encrypted_password
  - raw_user_meta_data (includes role)
- **Created**: Automatically when user signs up

### 2. `public.user_profiles` (Your Main Profile Table)
- **Purpose**: General profile information for ALL users
- **Who**: Everyone (all roles)
- **Contains**:
  - id (references auth.users.id)
  - full_name
  - email
  - **role** ('seeker', 'landlord', 'renovator')
  - **user_type** ('tenant', 'buyer', 'landlord', 'renovator') ← THIS IS MISSING!
  - phone
  - age
  - nationality
  - occupation
  - etc.
- **Created**: Automatically via trigger when user signs up
- **Used by**: SeekerProfile.tsx, general profile pages

### 3. `public.roommate` (Seeker-Specific Extended Profile)
- **Purpose**: Extended profile for roommate matching
- **Who**: Only users looking for roommates (seekers/tenants)
- **Contains**:
  - user_id (references auth.users.id)
  - Housing preferences (budget, location, move-in date)
  - Lifestyle preferences (smoking, pets, work schedule)
  - Roommate preferences (age range, gender, hobbies)
  - Importance ratings for each preference
- **Created**: When seeker fills out roommate profile
- **Used by**: ProfileForm.tsx, roommate matching algorithm

### 4. `public.landlord_verifications` (Landlord-Specific)
- **Purpose**: KYC and license verification for landlords
- **Who**: Only landlords/realtors
- **Contains**:
  - user_id
  - license_number
  - verification_status
  - documents
- **Created**: When landlord submits verification
- **Used by**: Landlord verification flow

### 5. `public.renovator_verifications` (Renovator-Specific)
- **Purpose**: License and certification verification
- **Who**: Only renovators/contractors
- **Contains**:
  - user_id
  - license_number
  - certifications
  - verification_status
- **Created**: When renovator submits verification
- **Used by**: Renovator verification flow

## Role System

### How Roles Are Assigned

1. **During Signup**:
   ```typescript
   // User signs up with role in metadata
   supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password',
     options: {
       data: {
         full_name: 'John Doe',
         role: 'tenant' // or 'landlord', 'renovator'
       }
     }
   })
   ```

2. **Trigger Creates Profile**:
   ```sql
   -- handle_new_user() trigger automatically creates user_profiles entry
   INSERT INTO user_profiles (id, full_name, role, email)
   VALUES (new_user.id, metadata.full_name, metadata.role, new_user.email)
   ```

3. **Role Stored in Two Places**:
   - `auth.users.raw_user_meta_data->>'role'` (Supabase Auth)
   - `user_profiles.role` (Your database)

### Role Values

- **'seeker'** / **'tenant'**: Looking for housing/roommates
- **'landlord'**: Property owners listing properties
- **'renovator'**: Renovation contractors/partners
- **'buyer'**: Looking to buy properties (variant of seeker)

## Current Issue

### The Problem
`SeekerProfile.tsx` is trying to save `user_type` to `user_profiles`, but the column doesn't exist.

### Why `user_type` vs `role`?
- **`role`**: Broad category (seeker, landlord, renovator)
- **`user_type`**: More specific (tenant, buyer, landlord, renovator)

Example:
- role = 'seeker', user_type = 'tenant' (looking to rent)
- role = 'seeker', user_type = 'buyer' (looking to buy)

### The Fix
Add the `user_type` column to `user_profiles` table using the QUICK_FIX.sql

## Data Flow Example

### Tenant Signs Up
```
1. User signs up → auth.users created
2. Trigger fires → user_profiles created with role='seeker'
3. User fills out profile → user_profiles updated with user_type='tenant'
4. User fills roommate form → roommate table entry created
5. Matching algorithm → queries roommate table for matches
```

### Landlord Signs Up
```
1. User signs up → auth.users created
2. Trigger fires → user_profiles created with role='landlord'
3. User fills out profile → user_profiles updated with user_type='landlord'
4. User submits verification → landlord_verifications entry created
5. User lists property → properties table entry created
```

## Summary

✅ **Single Auth System**: All users in `auth.users`
✅ **Role-Based Access**: Determined by `role` field
✅ **One Main Profile**: `user_profiles` for everyone
✅ **Extended Profiles**: Separate tables for specific features (roommate, verifications)
❌ **Missing Column**: `user_type` needs to be added to `user_profiles`

This is a clean, scalable architecture that avoids data duplication while allowing role-specific features.
