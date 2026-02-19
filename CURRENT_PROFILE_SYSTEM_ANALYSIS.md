# Current Profile System Analysis

## What I Found

### Existing Profile Pages:

1. **SeekerProfile.tsx** (`/dashboard/profile`)
   - Saves to: `user_profiles` table
   - For: Tenants/Seekers
   - Fields: All tenant-specific fields mixed with common fields

2. **LandlordProfile.tsx** (`/dashboard/landlord/profile`)
   - Saves to: 
     - `user_profiles` (basic info: name, email)
     - `landlord_verifications` (verification data: license, documents)
   - For: Landlords
   - Fields: Verification and KYC data

3. **RenovatorProfile.tsx** (`/renovator/profile`)
   - Saves to: `renovation_partners` table
   - For: Renovators
   - Fields: Company info, services, certifications

4. **Profile.tsx** (`/dashboard/profile`)
   - Just redirects to roommate recommendations
   - Not actually used

---

## Current Database Tables

### 1. `user_profiles` (Mixed Use - PROBLEM!)
**Used by**: SeekerProfile, LandlordProfile (partially)
**Contains**: 
- Common fields (name, email, phone, age)
- Tenant-specific fields (preferred_location, budget_range, housing_type, etc.)
- Landlord fields (role)
- 80+ columns total!

**Problem**: This table has become a dumping ground with fields for all roles mixed together.

### 2. `landlord_verifications` (Landlord-Specific)
**Used by**: LandlordProfile
**Contains**:
- user_id
- user_type (landlord/realtor/property_manager)
- license_number
- license_document_url
- id_document_url
- verification_status
- verification_date

**Status**: ✅ Good - Clean separation

### 3. `renovation_partners` (Renovator-Specific)
**Used by**: RenovatorProfile
**Contains**:
- user_id
- company
- name
- phone
- email
- location
- description
- specialties
- website_url
- business_scope
- license_url
- government_id_url
- verified

**Status**: ✅ Good - Clean separation

### 4. `roommate` (Tenant Roommate Matching)
**Used by**: ProfileForm (roommate matching feature)
**Contains**:
- All roommate matching preferences
- Housing preferences
- Lifestyle preferences
- Roommate preferences

**Status**: ✅ Good - Clean separation for feature-specific data

---

## The Problem

### Current State:
```
user_profiles (MESSY - 80+ columns)
├── Common fields (name, email, phone) ✅
├── Tenant fields (preferred_location, budget_range, etc.) ❌ Should be in tenant_profiles
├── Landlord fields (role) ✅
└── Random fields (smoking, has_pets, diet, etc.) ❌ Should be in tenant_profiles

landlord_verifications ✅ (Good)
renovation_partners ✅ (Good)
roommate ✅ (Good - but overlaps with user_profiles tenant fields)
```

### Issues:
1. **user_profiles is bloated** - 80+ columns, most are NULL for non-tenants
2. **Duplicate data** - Tenant fields in both `user_profiles` AND `roommate`
3. **Inconsistent** - Landlords and renovators have separate tables, but tenants don't
4. **Confusing** - Hard to know which fields apply to which role

---

## Recommended Fix

### Target State:
```
user_profiles (CLEAN - ~15 columns)
├── Common fields only (name, email, phone, age, role, etc.)
│
├─→ tenant_profiles (NEW - tenant-specific)
│   └── Housing search, lifestyle, preferences
│
├─→ landlord_verifications (EXISTS - landlord KYC)
│   └── License, verification status
│
├─→ renovation_partners (EXISTS - renovator business)
│   └── Company info, services, certifications
│
└─→ roommate (EXISTS - roommate matching feature)
    └── Roommate matching preferences
```

---

## Migration Plan

### Phase 1: Create tenant_profiles Table
```sql
CREATE TABLE tenant_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Housing Search
    preferred_locations TEXT[],
    budget_min INTEGER,
    budget_max INTEGER,
    move_in_date DATE,
    housing_type TEXT,
    living_space TEXT,
    
    -- Lifestyle
    smoking BOOLEAN DEFAULT false,
    has_pets BOOLEAN DEFAULT false,
    pet_type TEXT,
    diet TEXT,
    diet_other TEXT,
    work_location TEXT,
    work_schedule TEXT,
    
    -- Preferences
    profile_visibility TEXT DEFAULT 'public',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2: Migrate Data
```sql
-- Copy tenant-specific data from user_profiles to tenant_profiles
INSERT INTO tenant_profiles (
    user_id, 
    preferred_locations, 
    budget_min, 
    budget_max,
    move_in_date,
    housing_type,
    living_space,
    smoking,
    has_pets,
    pet_type,
    diet,
    diet_other,
    work_location,
    work_schedule,
    profile_visibility
)
SELECT 
    id,
    ARRAY[preferred_location]::TEXT[], -- Convert to array
    CASE WHEN budget_range IS NOT NULL THEN split_part(budget_range, '-', 1)::INTEGER END,
    CASE WHEN budget_range IS NOT NULL THEN split_part(budget_range, '-', 2)::INTEGER END,
    move_in_date_start,
    housing_type,
    living_space,
    CASE WHEN smoking = 'Yes' THEN true ELSE false END,
    has_pets,
    pet_type,
    diet,
    diet_other,
    work_location,
    work_schedule,
    profile_visibility
FROM user_profiles
WHERE role = 'tenant' OR role LIKE '%tenant%' OR role = 'seeker';
```

### Phase 3: Update SeekerProfile.tsx
```typescript
// Change from saving to user_profiles
// To saving to both user_profiles (common) + tenant_profiles (specific)

const onSubmit = async (values: ProfileFormValues) => {
    // 1. Save common fields to user_profiles
    const commonFields = {
        id: user.id,
        full_name: values.full_name,
        age: values.age,
        email: values.email,
        phone: values.phone,
        nationality: values.nationality,
        occupation: values.occupation,
        // ... other common fields
    };
    
    await supabase
        .from('user_profiles')
        .upsert(commonFields);
    
    // 2. Save tenant-specific fields to tenant_profiles
    const tenantFields = {
        user_id: user.id,
        preferred_locations: [values.preferred_location],
        budget_min: parseInt(values.budget_range.split('-')[0]),
        budget_max: parseInt(values.budget_range.split('-')[1]),
        move_in_date: values.move_in_date_start,
        housing_type: values.housing_type,
        smoking: values.smoking === 'Yes',
        has_pets: values.has_pets,
        // ... other tenant fields
    };
    
    await supabase
        .from('tenant_profiles')
        .upsert(tenantFields);
};
```

### Phase 4: Clean Up user_profiles (Optional)
```sql
-- Remove tenant-specific columns from user_profiles
ALTER TABLE user_profiles DROP COLUMN preferred_location;
ALTER TABLE user_profiles DROP COLUMN budget_range;
ALTER TABLE user_profiles DROP COLUMN move_in_date_start;
-- ... etc
```

---

## Summary

### Current State:
- ✅ Landlords: Have `landlord_verifications` table
- ✅ Renovators: Have `renovation_partners` table
- ❌ Tenants: Everything mixed in `user_profiles` (80+ columns!)

### What You Need:
- Create `tenant_profiles` table
- Move tenant-specific fields from `user_profiles` to `tenant_profiles`
- Update `SeekerProfile.tsx` to save to both tables
- Keep `user_profiles` lean with only common fields

### Benefits:
- ✅ Consistent architecture across all roles
- ✅ Clean separation of concerns
- ✅ No more 80+ column table
- ✅ Easy to maintain and extend
- ✅ Better performance (smaller tables)

### Next Steps:
1. Create `tenant_profiles` table
2. Migrate existing data
3. Update `SeekerProfile.tsx` to use both tables
4. Test thoroughly
5. Clean up old columns (optional)
