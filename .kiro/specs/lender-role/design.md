# Lender Role - Technical Design

## 1. Database Schema

### 1.1 lender_profiles Table

```sql
CREATE TABLE IF NOT EXISTS public.lender_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  license_number TEXT,
  license_state TEXT,
  nmls_id TEXT, -- Nationwide Multistate Licensing System ID
  company_address TEXT,
  company_city TEXT,
  company_province TEXT,
  company_postal_code TEXT,
  company_description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lender_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own lender profile"
  ON lender_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lender profile"
  ON lender_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lender profile"
  ON lender_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active lender profiles"
  ON lender_profiles FOR SELECT
  USING (is_active = TRUE AND is_verified = TRUE);
```

### 1.2 lender_rates Table

```sql
CREATE TABLE IF NOT EXISTS public.lender_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL, -- 'fixed', 'variable', 'fha', 'va', 'conventional', ' jumbo'
  term_years INTEGER NOT NULL, -- 15, 20, 30, etc.
  interest_rate DECIMAL(5,3) NOT NULL, -- e.g., 6.500
  apr DECIMAL(5,3),
  points DECIMAL(5,3) DEFAULT 0, -- discount points
  min_loan_amount DECIMAL(12,2),
  max_loan_amount DECIMAL(12,2),
  min_credit_score INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lender_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Lender can view their own rates"
  ON lender_rates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lender_profiles
      WHERE lender_profiles.id = lender_rates.lender_id
      AND lender_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Lender can manage their own rates"
  ON lender_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lender_profiles
      WHERE lender_profiles.id = lender_rates.lender_id
      AND lender_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active rates"
  ON lender_rates FOR SELECT
  USING (is_active = TRUE);
```

### 1.3 lender_rate_history Table (Audit Log)

```sql
CREATE TABLE IF NOT EXISTS public.lender_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  rate_id UUID REFERENCES public.lender_rates(id) ON DELETE SET NULL,
  loan_type TEXT NOT NULL,
  term_years INTEGER NOT NULL,
  old_rate DECIMAL(5,3),
  new_rate DECIMAL(5,3),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);
```

### 1.4 Update user_profiles Role Enum

```sql
-- Add 'lender' to user_role enum if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('seeker', 'landlord', 'buyer', 'mortgage_broker', 'lawyer', 'lender', 'admin', 'construction');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add 'lender' value if not exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lender';
```

### 1.5 Update mortgage_profiles Table

```sql
-- Add lender_id to mortgage_profiles for tracking
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES public.lender_profiles(id);

-- Add consent tracking for lender access
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS lender_access_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS consent_granted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS consent_granted_to UUID REFERENCES auth.users(id);
```

## 2. TypeScript Types

### 2.1 Lender Profile Type

```typescript
export interface LenderProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  license_number?: string;
  license_state?: string;
  nmls_id?: string;
  company_address?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;
  company_description?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LenderRate {
  id: string;
  lender_id: string;
  loan_type: 'fixed' | 'variable' | 'fha' | 'va' | 'conventional' | 'jumbo';
  term_years: number;
  interest_rate: number;
  apr?: number;
  points: number;
  min_loan_amount?: number;
  max_loan_amount?: number;
  min_credit_score?: number;
  is_active: boolean;
  effective_date: string;
  expiration_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

## 3. Services

### 3.1 lenderService.ts

```typescript
// src/services/lenderService.ts

import { supabase } from "@/integrations/supabase/client";

export interface CreateLenderProfileInput {
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  license_number?: string;
  license_state?: string;
  nmls_id?: string;
  company_address?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;
  company_description?: string;
}

export interface CreateLenderRateInput {
  lender_id: string;
  loan_type: string;
  term_years: number;
  interest_rate: number;
  apr?: number;
  points?: number;
  min_loan_amount?: number;
  max_loan_amount?: number;
  min_credit_score?: number;
  notes?: string;
}

// Get lender profile by user ID
export async function getLenderProfile(userId: string): Promise<LenderProfile | null> {
  const { data, error } = await supabase
    .from('lender_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Create lender profile
export async function createLenderProfile(input: CreateLenderProfileInput): Promise<LenderProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('lender_profiles')
    .insert({
      user_id: user.id,
      ...input
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update lender profile
export async function updateLenderProfile(
  profileId: string,
  updates: Partial<CreateLenderProfileInput>
): Promise<LenderProfile> {
  const { data, error } = await supabase
    .from('lender_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get lender rates
export async function getLenderRates(lenderId: string): Promise<LenderRate[]> {
  const { data, error } = await supabase
    .from('lender_rates')
    .select('*')
    .eq('lender_id', lenderId)
    .eq('is_active', true)
    .order('loan_type', { ascending: true })
    .order('term_years', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Create lender rate
export async function createLenderRate(input: CreateLenderRateInput): Promise<LenderRate> {
  // Deactivate old rates of same type
  await supabase
    .from('lender_rates')
    .update({ is_active: false })
    .eq('lender_id', input.lender_id)
    .eq('loan_type', input.loan_type)
    .eq('term_years', input.term_years);
  
  const { data, error } = await supabase
    .from('lender_rates')
    .insert({
      ...input,
      is_active: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get all active lenders (public)
export async function getActiveLenders(): Promise<LenderProfile[]> {
  const { data, error } = await supabase
    .from('lender_profiles')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('company_name', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Get all active rates (public)
export async function getActiveRates(): Promise<LenderRate[]> {
  const { data, error } = await supabase
    .from('lender_rates')
    .select('*, lender:lender_profiles(*)')
    .eq('is_active', true)
    .order('interest_rate', { ascending: true });
  
  if (error) throw error;
  return data;
}
```

## 4. Frontend Components

### 4.1 Pages Structure

```
src/pages/dashboard/lender/
├── LenderDashboard.tsx      # Main dashboard
├── LenderProfile.tsx        # Company profile management
├── LenderRates.tsx          # Rate management
├── LenderRequests.tsx       # Mortgage requests
└── LenderLayout.tsx         # Layout wrapper
```

### 4.2 Lender Dashboard Components

```typescript
// LenderDashboard.tsx - Main dashboard
export default function LenderDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lender Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Active Rates" value={ratesCount} />
        <StatsCard title="Pending Requests" value={pendingCount} />
        <StatsCard title="Quotes Sent" value={quotesCount} />
        <StatsCard title="Approved Loans" value={approvedCount} />
      </div>
      
      {/* Recent Activity */}
      <RecentActivitySection />
      
      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

// LenderRates.tsx - Rate management
export default function LenderRates() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Rates</h1>
        <Button onClick={() => setShowAddRate(true)}>Add New Rate</Button>
      </div>
      
      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rates.map(rate => (
          <RateCard key={rate.id} rate={rate} onEdit={handleEdit} />
        ))}
      </div>
      
      {/* Add Rate Modal */}
      {showAddRate && <AddRateModal onClose={() => setShowAddRate(false)} />}
    </div>
  );
}
```

## 5. Signup Integration

### 5.1 Signup Page Update

Update the signup flow to include "Lender" as a role option:

```typescript
// In signup component
const userRoles = [
  { value: 'seeker', label: 'Tenant/Seeker' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'mortgage_broker', label: 'Mortgage Broker' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'lender', label: 'Lender' }, // NEW
];
```

### 5.2 After Signup Redirect

```typescript
// In auth callback or signup completion
if (role === 'lender') {
  navigate('/dashboard/lender/profile');
} else if (role === 'lawyer') {
  navigate('/dashboard/lawyer');
}
// ... other roles
```

## 6. Integration with Mortgage Profiles

### 6.1 Consent Flow

```typescript
// When seeker grants lender access
export async function grantLenderAccess(
  mortgageProfileId: string,
  lenderId: string
): Promise<void> {
  await supabase
    .from('mortgage_profiles')
    .update({
      lender_access_consent: true,
      consent_granted_at: new Date().toISOString(),
      consent_granted_to: lenderId,
      lender_id: lenderId
    })
    .eq('id', mortgageProfileId);
}
```

### 6.2 Lender View of Mortgage Profiles

```typescript
// Get mortgage profiles with consent for this lender
export async function getLenderMortgageProfiles(lenderId: string): Promise<MortgageProfile[]> {
  const { data, error } = await supabase
    .from('mortgage_profiles')
    .select('*, user:user_profiles(*)')
    .eq('lender_id', lenderId)
    .eq('lender_access_consent', true);
  
  if (error) throw error;
  return data;
}
```

## 7. Navigation Menu Update

### 7.1 Main Navigation

```typescript
// In navigation component
const navItems = [
  { path: '/dashboard', label: 'Dashboard', roles: ['seeker', 'landlord', 'buyer'] },
  { path: '/dashboard/lender', label: 'Lender Dashboard', roles: ['lender'] },
  { path: '/dashboard/mortgage', label: 'Mortgage Broker', roles: ['mortgage_broker'] },
  { path: '/dashboard/lawyer', label: 'Lawyer Dashboard', roles: ['lawyer'] },
  // ...
];
```

## 8. File Summary

| File | Description |
|------|-------------|
| `supabase/migrations/{date}_create_lender_tables.sql` | Database schema |
| `src/types/lender.ts` | TypeScript interfaces |
| `src/services/lenderService.ts` | API service functions |
| `src/pages/dashboard/lender/LenderDashboard.tsx` | Main dashboard |
| `src/pages/dashboard/lender/LenderProfile.tsx` | Profile management |
| `src/pages/dashboard/lender/LenderRates.tsx` | Rate management |
| `src/pages/dashboard/lender/LenderRequests.tsx` | Mortgage requests |
| `src/components/lender/LenderRateCard.tsx` | Rate display component |
| `src/components/lender/LenderProfileCard.tsx` | Public profile card |

## 9. Workflow Summary

```
1. User signs up as "Lender"
   ↓
2. Creates lender_profile
   ↓
3. Sets interest rates
   ↓
4. Seeker grants consent to view mortgage profile
   ↓
5. Lender views mortgage profile and provides rate quote
   ↓
6. Seeker accepts quote (optional)
```