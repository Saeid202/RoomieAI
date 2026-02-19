# Tenant Profiles Table Setup Guide

## What This Does

Creates a `tenant_profiles` table to store tenant-specific data, matching the architecture you already have for landlords (`landlord_verifications`) and renovators (`renovation_partners`).

## Before Running

### Current State:
```
user_profiles (80+ columns - MESSY)
├── Common fields + Tenant fields mixed together
│
landlord_verifications ✅
renovation_partners ✅
```

### After Running:
```
user_profiles (Clean - common fields only)
├─→ tenant_profiles ✅ (NEW)
├─→ landlord_verifications ✅
└─→ renovation_partners ✅
```

---

## Step-by-Step Instructions

### Step 1: Run the Migration

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `create_tenant_profiles_table.sql`
4. Paste and click "Run"

**What it does:**
- ✅ Creates `tenant_profiles` table
- ✅ Adds indexes for performance
- ✅ Sets up RLS policies for security
- ✅ Migrates existing tenant data from `user_profiles`
- ✅ Adds triggers for `updated_at`

**Expected output:**
```
tenant_profiles table created successfully
migrated_records: [number of tenants]
```

### Step 2: Verify the Migration

1. In SQL Editor, run `verify_tenant_profiles.sql`
2. Check the results:
   - ✓ Table exists
   - ✓ All columns present
   - ✓ Records migrated
   - ✓ RLS policies active

### Step 3: Test a Query

```sql
-- Get a tenant's complete profile
SELECT 
    up.*,
    tp.*
FROM user_profiles up
LEFT JOIN tenant_profiles tp ON up.id = tp.user_id
WHERE up.email = 'your-email@example.com';
```

---

## What Gets Migrated

### From `user_profiles` → `tenant_profiles`:

**Housing Search:**
- preferred_location → preferred_locations (converted to array)
- budget_range → budget_min, budget_max (split into two fields)
- move_in_date_start
- move_in_date_end
- housing_type
- living_space

**Lifestyle:**
- smoking
- lives_with_smokers
- has_pets
- pet_type
- pet_preference
- diet
- diet_other

**Work:**
- work_location
- work_location_legacy
- work_schedule

**Profile:**
- profile_visibility
- prefer_not_to_say
- hobbies
- about_me
- linkedin

### Stays in `user_profiles` (Common fields):
- id
- role
- user_type
- full_name
- email
- phone
- age
- gender
- nationality
- occupation
- languages_spoken
- current_city
- current_country
- profile_image_url
- bio
- created_at
- updated_at

---

## Database Schema

```sql
tenant_profiles
├── user_id (UUID, PRIMARY KEY, references user_profiles.id)
├── preferred_locations (TEXT[])
├── budget_min (INTEGER)
├── budget_max (INTEGER)
├── move_in_date_start (DATE)
├── move_in_date_end (DATE)
├── housing_type (TEXT)
├── living_space (TEXT)
├── smoking (TEXT)
├── lives_with_smokers (TEXT)
├── has_pets (BOOLEAN)
├── pet_type (TEXT)
├── pet_preference (TEXT)
├── diet (TEXT)
├── diet_other (TEXT)
├── work_location (TEXT)
├── work_location_legacy (TEXT)
├── work_schedule (TEXT)
├── profile_visibility (TEXT)
├── prefer_not_to_say (TEXT)
├── hobbies (TEXT[])
├── about_me (TEXT)
├── linkedin (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## RLS Policies

The table has Row Level Security enabled with these policies:

1. **View own profile**: Users can SELECT their own tenant profile
2. **Insert own profile**: Users can INSERT their own tenant profile
3. **Update own profile**: Users can UPDATE their own tenant profile
4. **Delete own profile**: Users can DELETE their own tenant profile

All policies check: `auth.uid() = user_id`

---

## Next Steps (After Migration)

### 1. Update SeekerProfile.tsx

You'll need to update the save logic to write to both tables:

```typescript
// Save common fields to user_profiles
await supabase
    .from('user_profiles')
    .upsert({
        id: user.id,
        full_name: data.full_name,
        age: data.age,
        email: data.email,
        // ... other common fields
    });

// Save tenant-specific fields to tenant_profiles
await supabase
    .from('tenant_profiles')
    .upsert({
        user_id: user.id,
        preferred_locations: [data.preferred_location],
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        // ... other tenant fields
    });
```

### 2. Update Profile Fetch Logic

```typescript
// Fetch both tables
const { data: coreProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

const { data: tenantProfile } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

// Merge the data
const completeProfile = {
    ...coreProfile,
    ...tenantProfile
};
```

### 3. Clean Up (Optional - Later)

After verifying everything works, you can optionally remove tenant-specific columns from `user_profiles`:

```sql
-- WARNING: Only run this after updating all code!
ALTER TABLE user_profiles DROP COLUMN preferred_location;
ALTER TABLE user_profiles DROP COLUMN budget_range;
-- ... etc
```

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Drop the table (this will delete all data in tenant_profiles)
DROP TABLE IF EXISTS public.tenant_profiles CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_tenant_profiles_updated_at() CASCADE;
```

**Note**: The original data in `user_profiles` is NOT deleted, so you can always recreate the table and re-migrate.

---

## Benefits

✅ **Clean Architecture**: Matches landlord_verifications and renovation_partners pattern
✅ **Better Performance**: Smaller, focused tables
✅ **No NULL Waste**: Only tenants have records in tenant_profiles
✅ **Easier Maintenance**: Clear separation of tenant-specific vs common fields
✅ **Scalable**: Easy to add new tenant-specific features
✅ **Consistent**: All roles now have their own extended profile tables

---

## Troubleshooting

### Issue: "relation tenant_profiles already exists"
**Solution**: The table already exists. Run `verify_tenant_profiles.sql` to check its status.

### Issue: "duplicate key value violates unique constraint"
**Solution**: Some users already have records in tenant_profiles. The migration uses `ON CONFLICT DO NOTHING` to handle this.

### Issue: No records migrated
**Solution**: Check if users have role = 'tenant' or 'seeker'. Run:
```sql
SELECT role, COUNT(*) FROM user_profiles GROUP BY role;
```

### Issue: Budget values are NULL
**Solution**: The original `budget_range` field might be in a different format. Check:
```sql
SELECT DISTINCT budget_range FROM user_profiles WHERE budget_range IS NOT NULL LIMIT 10;
```

---

## Summary

This migration creates a clean, consistent architecture where:
- **Common fields** → `user_profiles`
- **Tenant-specific fields** → `tenant_profiles`
- **Landlord-specific fields** → `landlord_verifications`
- **Renovator-specific fields** → `renovation_partners`

Run `create_tenant_profiles_table.sql` now to set it up!
