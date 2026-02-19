# Database Architecture: Single Table vs Separate Tables

## Your Current Architecture (Hybrid Approach)

```
auth.users (authentication)
    ↓
user_profiles (ONE table for ALL users with role field)
    ↓
Extended tables based on features:
- roommate (for roommate matching)
- landlord_verifications (for KYC)
- renovator_verifications (for licenses)
```

## Option 1: Single Table (What You Have Now)

### Structure
```sql
user_profiles
├── id
├── role (landlord/tenant/renovator)
├── Common fields (name, email, phone, etc.)
├── Tenant-specific fields (preferred_location, budget_range, etc.)
├── Landlord-specific fields (?)
└── Renovator-specific fields (?)
```

### ✅ Advantages
1. **Simpler queries** - No joins needed for basic user info
2. **Easy role switching** - User can change from tenant to landlord easily
3. **Unified user management** - One place to manage all users
4. **Shared fields** - No duplication of common data (name, email, phone)
5. **Easier authentication** - One profile per user
6. **Better for analytics** - Easy to count total users, compare roles

### ❌ Disadvantages
1. **Sparse data** - Many NULL values (tenant fields empty for landlords)
2. **Large table** - Can become very wide with many columns
3. **Unclear schema** - Hard to know which fields apply to which role
4. **Wasted storage** - Storing NULL values for unused fields
5. **Complex validation** - Need to validate different fields per role

### Best For:
- Users who might have multiple roles
- Platforms with many shared fields
- Simple role-based access control

---

## Option 2: Separate Tables (Role-Specific)

### Structure
```sql
auth.users (authentication only)
    ↓
├── tenant_profiles
│   ├── user_id
│   ├── preferred_location
│   ├── budget_range
│   └── move_in_date
│
├── landlord_profiles
│   ├── user_id
│   ├── properties_count
│   ├── license_number
│   └── verification_status
│
└── renovator_profiles
    ├── user_id
    ├── company_name
    ├── certifications
    └── service_areas
```

### ✅ Advantages
1. **Clean schema** - Each table has only relevant fields
2. **No NULL values** - Every field is used
3. **Better performance** - Smaller, focused tables
4. **Clear intent** - Easy to understand what each table is for
5. **Easier validation** - Each table has its own rules
6. **Type safety** - Can use specific types per role
7. **Independent scaling** - Can optimize each table separately

### ❌ Disadvantages
1. **Complex queries** - Need joins to get user info
2. **Duplicate data** - Common fields (name, email) in multiple places
3. **Role switching is hard** - Need to move data between tables
4. **More maintenance** - Multiple tables to manage
5. **Harder analytics** - Need UNION queries to count all users
6. **Authentication complexity** - Need to check multiple tables

### Best For:
- Roles with very different data needs
- Users who never change roles
- High-scale systems with role-specific optimization needs

---

## Option 3: Hybrid Approach (RECOMMENDED for RoomieAI)

This is actually what you're moving toward, and it's the best solution!

### Structure
```sql
auth.users (authentication)
    ↓
user_profiles (common fields + role)
├── id
├── role
├── full_name
├── email
├── phone
├── age
├── nationality
└── [other common fields]
    ↓
Extended tables (role-specific features):
├── roommate (tenant-specific matching data)
├── landlord_verifications (landlord KYC)
├── renovator_verifications (renovator licenses)
└── landlord_properties (property management)
```

### ✅ Advantages (Best of Both Worlds!)
1. **Clean core table** - Only common fields in user_profiles
2. **No NULL waste** - Extended tables only created when needed
3. **Easy queries** - Common data in one place
4. **Role flexibility** - Users can have multiple roles (tenant + landlord)
5. **Feature-based** - Tables organized by features, not just roles
6. **Scalable** - Can add new role-specific tables easily
7. **Clear separation** - Core profile vs feature-specific data

### ❌ Disadvantages
1. **Slightly more complex** - Need to understand the relationship
2. **Requires joins** - For role-specific data
3. **More tables** - But each has a clear purpose

### Best For:
- Multi-role platforms (like yours!)
- Platforms with both shared and role-specific needs
- Growing platforms that need flexibility

---

## Recommendation for RoomieAI: Hybrid Approach

### Why This is Best for You:

1. **Multi-role users**: A landlord might also be looking for a roommate
2. **Shared features**: Messaging, profiles, verification work across roles
3. **Feature-based**: Roommate matching is a feature, not just for tenants
4. **Clean separation**: Core identity vs role-specific functionality

### Recommended Structure:

```sql
-- Core identity (everyone)
user_profiles
├── id
├── role (can be multiple: 'tenant,landlord')
├── user_type (primary type)
├── full_name
├── email
├── phone
├── age
├── nationality
├── occupation
└── [other common fields]

-- Feature: Roommate Matching (anyone looking for roommates)
roommate
├── user_id
├── housing_preferences
├── lifestyle_preferences
├── roommate_preferences
└── matching_criteria

-- Feature: Property Management (landlords)
landlord_verifications
├── user_id
├── license_number
├── verification_status
└── documents

properties
├── id
├── user_id (landlord)
├── address
└── details

-- Feature: Renovation Services (renovators)
renovator_verifications
├── user_id
├── company_name
├── certifications
└── service_areas

-- Feature: Messaging (everyone)
conversations
├── id
├── participant_1_id
├── participant_2_id
└── messages
```

### Migration Path:

**Current State**: You have `user_profiles` with ALL fields mixed together

**Target State**: 
1. Keep `user_profiles` lean with only common fields
2. Move tenant-specific fields to `roommate` table (already exists!)
3. Create `landlord_profiles` for landlord-specific data
4. Create `renovator_profiles` for renovator-specific data

### What to Move:

**Keep in user_profiles** (common to all):
- id, role, user_type
- full_name, email, phone
- age, gender, nationality
- occupation, languages_spoken
- profile_image_url, bio
- created_at, updated_at

**Move to roommate** (tenant-specific):
- preferred_location, budget_range
- move_in_date_start, housing_type
- smoking, has_pets, diet
- roommate preferences
- matching criteria

**Move to landlord_profiles** (landlord-specific):
- properties_count
- average_rating
- response_time
- landlord-specific settings

**Move to renovator_profiles** (renovator-specific):
- company_name
- service_areas
- certifications
- portfolio

---

## Implementation Recommendation

### Phase 1: Clean Up (Do This Now)
1. ✅ Keep `user_profiles` with common fields
2. ✅ Keep `roommate` table for matching features
3. ✅ Keep verification tables separate
4. ❌ Remove tenant-specific fields from `user_profiles` (or mark as deprecated)

### Phase 2: Create Role-Specific Tables (Future)
```sql
-- For landlords
CREATE TABLE landlord_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
    properties_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    response_time_hours INTEGER,
    preferred_tenant_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For renovators
CREATE TABLE renovator_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
    company_name TEXT,
    service_areas TEXT[],
    years_experience INTEGER,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: Migrate Data
- Move tenant-specific data from `user_profiles` to `roommate`
- Create landlord/renovator profiles for existing users
- Update application code to query the right tables

---

## Summary

**Best Architecture for RoomieAI**: **Hybrid Approach**

✅ **DO**:
- One `user_profiles` table for common fields
- Separate feature-specific tables (`roommate`, `landlord_profiles`, etc.)
- Use `role` field to determine which extended tables to query

❌ **DON'T**:
- Put all fields in one giant table
- Create completely separate user tables per role
- Duplicate common fields across tables

This gives you:
- Clean, maintainable code
- Flexibility for multi-role users
- Good performance
- Easy to add new features
- Clear separation of concerns

**Your current architecture is actually pretty good!** You just need to:
1. Clean up `user_profiles` (remove tenant-specific fields)
2. Ensure `roommate` table has all tenant-specific data
3. Create `landlord_profiles` and `renovator_profiles` tables
4. Update your code to query the right tables based on role
