# Multi-Role Profile System Design

## The Challenge
- All users in ONE `user_profiles` table
- Each role (landlord, tenant, renovator) needs different profile pages
- Each role has different fields and features

## Recommended Solution: Feature-Based Extended Profiles

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              user_profiles (Core Profile)               │
│  - Common fields for ALL users                          │
│  - id, role, full_name, email, phone, age, etc.        │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   tenant_    │  │  landlord_   │  │  renovator_      │
│   profiles   │  │  profiles    │  │  profiles        │
│              │  │              │  │                  │
│ Extended     │  │ Extended     │  │ Extended         │
│ profile for  │  │ profile for  │  │ profile for      │
│ tenants      │  │ landlords    │  │ renovators       │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## Database Schema

### 1. Core Profile (Everyone)
```sql
-- user_profiles: Common fields for ALL users
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    
    -- Identity
    role TEXT NOT NULL, -- 'tenant', 'landlord', 'renovator', or 'tenant,landlord'
    user_type TEXT DEFAULT 'tenant',
    
    -- Basic Info (common to all)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    
    -- Location (common to all)
    nationality TEXT,
    current_city TEXT,
    current_country TEXT DEFAULT 'Canada',
    
    -- Professional (common to all)
    occupation TEXT,
    languages_spoken TEXT[],
    
    -- Profile
    bio TEXT,
    profile_image_url TEXT,
    profile_visibility TEXT DEFAULT 'public',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tenant Extended Profile
```sql
-- tenant_profiles: Tenant-specific fields
CREATE TABLE tenant_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Housing Search
    preferred_locations TEXT[], -- Array of cities/neighborhoods
    budget_min INTEGER,
    budget_max INTEGER,
    move_in_date DATE,
    housing_type TEXT, -- 'apartment', 'house', 'room'
    
    -- Lifestyle
    smoking BOOLEAN DEFAULT false,
    has_pets BOOLEAN DEFAULT false,
    pet_types TEXT[],
    diet_preferences TEXT,
    work_schedule TEXT, -- 'day', 'night', 'flexible'
    
    -- Roommate Preferences (if looking for roommates)
    looking_for_roommate BOOLEAN DEFAULT false,
    roommate_gender_preference TEXT[],
    roommate_age_range INTEGER[],
    
    -- Verification
    employment_verified BOOLEAN DEFAULT false,
    income_verified BOOLEAN DEFAULT false,
    background_check_status TEXT DEFAULT 'not_started',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Landlord Extended Profile
```sql
-- landlord_profiles: Landlord-specific fields
CREATE TABLE landlord_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Business Info
    company_name TEXT,
    business_type TEXT, -- 'individual', 'company', 'property_management'
    license_number TEXT,
    
    -- Portfolio
    properties_count INTEGER DEFAULT 0,
    total_units INTEGER DEFAULT 0,
    
    -- Performance
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    response_time_hours INTEGER,
    
    -- Preferences
    preferred_tenant_type TEXT, -- 'students', 'professionals', 'families', 'any'
    minimum_lease_term INTEGER, -- months
    accepts_pets BOOLEAN DEFAULT false,
    
    -- Verification
    identity_verified BOOLEAN DEFAULT false,
    license_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending',
    verification_date TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Renovator Extended Profile
```sql
-- renovator_profiles: Renovator-specific fields
CREATE TABLE renovator_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Business Info
    company_name TEXT NOT NULL,
    business_registration_number TEXT,
    insurance_number TEXT,
    
    -- Services
    service_types TEXT[], -- ['kitchen', 'bathroom', 'flooring', 'painting']
    service_areas TEXT[], -- Cities/regions they serve
    
    -- Experience
    years_experience INTEGER,
    completed_projects INTEGER DEFAULT 0,
    
    -- Portfolio
    portfolio_url TEXT,
    portfolio_images TEXT[],
    
    -- Performance
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    response_time_hours INTEGER,
    
    -- Pricing
    hourly_rate_min INTEGER,
    hourly_rate_max INTEGER,
    offers_free_quotes BOOLEAN DEFAULT true,
    
    -- Verification
    license_verified BOOLEAN DEFAULT false,
    insurance_verified BOOLEAN DEFAULT false,
    background_check_status TEXT DEFAULT 'not_started',
    verification_status TEXT DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Frontend Implementation

### 1. Profile Page Routing

```typescript
// src/pages/dashboard/Profile.tsx
import { useAuth } from "@/hooks/useAuth";
import TenantProfile from "./TenantProfile";
import LandlordProfile from "./LandlordProfile";
import RenovatorProfile from "./RenovatorProfile";

export default function ProfilePage() {
    const { user, profile } = useAuth();
    
    // Route to correct profile based on role
    if (profile?.role === 'tenant') {
        return <TenantProfile />;
    }
    
    if (profile?.role === 'landlord') {
        return <LandlordProfile />;
    }
    
    if (profile?.role === 'renovator') {
        return <RenovatorProfile />;
    }
    
    // Multi-role user - show tabs
    if (profile?.role?.includes(',')) {
        return <MultiRoleProfile roles={profile.role.split(',')} />;
    }
    
    return <div>Please select your role</div>;
}
```

### 2. Profile Service (Backend Logic)

```typescript
// src/services/profileService.ts

export async function fetchUserProfile(userId: string) {
    // 1. Get core profile
    const { data: coreProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (!coreProfile) return null;
    
    // 2. Get extended profile based on role
    let extendedProfile = null;
    
    if (coreProfile.role === 'tenant') {
        const { data } = await supabase
            .from('tenant_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        extendedProfile = data;
    }
    
    if (coreProfile.role === 'landlord') {
        const { data } = await supabase
            .from('landlord_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        extendedProfile = data;
    }
    
    if (coreProfile.role === 'renovator') {
        const { data } = await supabase
            .from('renovator_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        extendedProfile = data;
    }
    
    // 3. Merge core + extended
    return {
        ...coreProfile,
        extended: extendedProfile
    };
}

export async function saveUserProfile(userId: string, role: string, data: any) {
    // 1. Save core profile fields
    const coreFields = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        // ... other common fields
    };
    
    await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...coreFields });
    
    // 2. Save extended profile based on role
    if (role === 'tenant') {
        const tenantFields = {
            user_id: userId,
            preferred_locations: data.preferred_locations,
            budget_min: data.budget_min,
            budget_max: data.budget_max,
            // ... other tenant fields
        };
        
        await supabase
            .from('tenant_profiles')
            .upsert(tenantFields);
    }
    
    if (role === 'landlord') {
        const landlordFields = {
            user_id: userId,
            company_name: data.company_name,
            license_number: data.license_number,
            // ... other landlord fields
        };
        
        await supabase
            .from('landlord_profiles')
            .upsert(landlordFields);
    }
    
    if (role === 'renovator') {
        const renovatorFields = {
            user_id: userId,
            company_name: data.company_name,
            service_types: data.service_types,
            // ... other renovator fields
        };
        
        await supabase
            .from('renovator_profiles')
            .upsert(renovatorFields);
    }
}
```

### 3. Profile Components

```typescript
// src/pages/dashboard/TenantProfile.tsx
export default function TenantProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    
    useEffect(() => {
        loadProfile();
    }, []);
    
    const loadProfile = async () => {
        const data = await fetchUserProfile(user.id);
        setProfile(data);
    };
    
    return (
        <div>
            <h1>Tenant Profile</h1>
            
            {/* Core Profile Section */}
            <CoreProfileSection profile={profile} />
            
            {/* Tenant-Specific Sections */}
            <HousingPreferencesSection profile={profile.extended} />
            <LifestyleSection profile={profile.extended} />
            <RoommatePreferencesSection profile={profile.extended} />
        </div>
    );
}

// src/pages/dashboard/LandlordProfile.tsx
export default function LandlordProfile() {
    // Similar structure but with landlord-specific sections
    return (
        <div>
            <h1>Landlord Profile</h1>
            <CoreProfileSection />
            <BusinessInfoSection />
            <PortfolioSection />
            <VerificationSection />
        </div>
    );
}

// src/pages/dashboard/RenovatorProfile.tsx
export default function RenovatorProfile() {
    // Similar structure but with renovator-specific sections
    return (
        <div>
            <h1>Renovator Profile</h1>
            <CoreProfileSection />
            <BusinessInfoSection />
            <ServicesSection />
            <PortfolioSection />
        </div>
    );
}
```

---

## Handling Multi-Role Users

Some users might be BOTH landlord AND tenant:

```typescript
// src/pages/dashboard/MultiRoleProfile.tsx
export default function MultiRoleProfile({ roles }: { roles: string[] }) {
    const [activeRole, setActiveRole] = useState(roles[0]);
    
    return (
        <div>
            {/* Role Switcher */}
            <Tabs value={activeRole} onValueChange={setActiveRole}>
                <TabsList>
                    {roles.includes('tenant') && <TabsTrigger value="tenant">Tenant Profile</TabsTrigger>}
                    {roles.includes('landlord') && <TabsTrigger value="landlord">Landlord Profile</TabsTrigger>}
                    {roles.includes('renovator') && <TabsTrigger value="renovator">Renovator Profile</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="tenant">
                    <TenantProfile />
                </TabsContent>
                
                <TabsContent value="landlord">
                    <LandlordProfile />
                </TabsContent>
                
                <TabsContent value="renovator">
                    <RenovatorProfile />
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

---

## Migration Strategy

### Phase 1: Create Extended Tables
```sql
-- Run these migrations
CREATE TABLE tenant_profiles (...);
CREATE TABLE landlord_profiles (...);
CREATE TABLE renovator_profiles (...);
```

### Phase 2: Migrate Existing Data
```sql
-- Move tenant-specific data from user_profiles to tenant_profiles
INSERT INTO tenant_profiles (user_id, preferred_locations, budget_min, budget_max, ...)
SELECT id, preferred_location, budget_range[1], budget_range[2], ...
FROM user_profiles
WHERE role = 'tenant' OR role LIKE '%tenant%';

-- Create landlord profiles for existing landlords
INSERT INTO landlord_profiles (user_id, verification_status)
SELECT id, 'pending'
FROM user_profiles
WHERE role = 'landlord' OR role LIKE '%landlord%';
```

### Phase 3: Update Application Code
1. Update profile fetch logic to query extended tables
2. Update profile save logic to save to correct tables
3. Update profile pages to show role-specific fields

### Phase 4: Clean Up (Optional)
```sql
-- Remove tenant-specific columns from user_profiles
ALTER TABLE user_profiles DROP COLUMN preferred_location;
ALTER TABLE user_profiles DROP COLUMN budget_range;
-- etc.
```

---

## Summary

### ✅ DO:
1. Keep `user_profiles` with common fields
2. Create `tenant_profiles`, `landlord_profiles`, `renovator_profiles`
3. Use role field to determine which extended table to query
4. Create separate profile pages per role
5. Support multi-role users with tabs

### ❌ DON'T:
1. Put all fields in `user_profiles`
2. Create separate user tables per role
3. Duplicate common fields across tables

### Benefits:
- ✅ Clean separation of concerns
- ✅ No NULL waste
- ✅ Easy to add role-specific features
- ✅ Supports multi-role users
- ✅ Scalable and maintainable
