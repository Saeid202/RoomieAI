# Design Document: Co-Ownership Profile

## Overview

The Co-Ownership Profile feature enables seekers to create a comprehensive profile expressing their intent to find a co-buyer partner. This profile is distinct from property-specific Signals and serves as a general matching profile for co-ownership opportunities. The feature will be implemented as a new page in the Buying Opportunities section, positioned beside the Co-Buying Scenario page.

The design follows the existing patterns established in the Roomie AI application, including the mortgage profile system, form validation patterns, and RLS security policies. The profile consists of four main sections: Financial Capacity, Property Preferences, Co-Ownership Preferences, and About You.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
├─────────────────────────────────────────────────────────────┤
│  CoOwnershipProfilePage (React Component)                   │
│    ├── ProfileCompletenessIndicator                         │
│    ├── FinancialCapacitySection                            │
│    ├── PropertyPreferencesSection                          │
│    ├── CoOwnershipPreferencesSection                       │
│    └── AboutYouSection                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  coOwnershipProfileService.ts                               │
│    ├── fetchCoOwnershipProfile()                           │
│    ├── saveCoOwnershipProfile()                            │
│    ├── calculateProfileCompleteness()                      │
│    └── validateProfileData()                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
├─────────────────────────────────────────────────────────────┤
│  co_ownership_profiles table (Supabase)                     │
│    ├── RLS Policies (owner-only access)                    │
│    ├── Indexes (user_id lookup)                            │
│    └── Triggers (updated_at timestamp)                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React, TypeScript, React Hook Form, Zod validation
- **UI Components**: Shadcn/ui components (Card, Form, Input, Select, Textarea, Button, Badge, Progress)
- **State Management**: React hooks (useState, useEffect)
- **Backend**: Supabase (PostgreSQL database, RLS policies)
- **Validation**: Zod schema validation
- **Routing**: React Router

## Components and Interfaces

### Database Schema

```typescript
interface CoOwnershipProfile {
  id: string;                          // UUID primary key
  user_id: string;                     // Foreign key to user_profiles
  
  // Financial Capacity
  budget_min: number | null;           // Minimum budget in dollars
  budget_max: number | null;           // Maximum budget in dollars
  down_payment: number | null;         // Down payment amount in dollars
  annual_income: number | null;        // Annual income in dollars
  credit_score_range: string | null;   // e.g., "650-699", "700-749", "750+"
  
  // Property Preferences
  property_types: string[];            // Array: ["condo", "townhouse", "detached", "semi-detached"]
  preferred_locations: string[];       // Array: ["Downtown Toronto", "North York", etc.]
  min_bedrooms: number | null;         // Minimum number of bedrooms
  purchase_timeline: string | null;    // "0-3 months", "3-6 months", "6-12 months", "12+ months"
  
  // Co-Ownership Preferences
  ownership_split: string | null;      // "50/50", "60/40", "70/30", "flexible"
  living_arrangements: string[];       // Array: ["live_together", "rent_out", "investment_only"]
  co_ownership_purposes: string[];     // Array: ["primary_residence", "investment", "vacation_property"]
  
  // About You
  age_range: string | null;            // "18-25", "26-35", "36-45", "46-55", "56+"
  occupation: string | null;           // Free text
  why_co_ownership: string | null;     // Free text (max 500 characters)
  
  // Metadata
  profile_completeness: number;        // Calculated percentage (0-100)
  created_at: timestamp;
  updated_at: timestamp;
}
```

### TypeScript Interfaces

```typescript
// Form data interface
interface CoOwnershipProfileFormData {
  // Financial Capacity
  budget_min: string;
  budget_max: string;
  down_payment: string;
  annual_income: string;
  credit_score_range: string;
  
  // Property Preferences
  property_types: string[];
  preferred_locations: string[];
  min_bedrooms: number;
  purchase_timeline: string;
  
  // Co-Ownership Preferences
  ownership_split: string;
  living_arrangements: string[];
  co_ownership_purposes: string[];
  
  // About You
  age_range: string;
  occupation: string;
  why_co_ownership: string;
}

// Profile completeness calculation
interface ProfileCompletenessMetrics {
  totalFields: number;
  filledFields: number;
  percentage: number;
  missingSections: string[];
}

// Validation error interface
interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'length';
}
```

### Zod Validation Schema

```typescript
const coOwnershipProfileSchema = z.object({
  // Financial Capacity
  budget_min: z.string()
    .min(1, "Minimum budget is required")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, "Must be a positive number"),
  budget_max: z.string()
    .min(1, "Maximum budget is required")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, "Must be a positive number"),
  down_payment: z.string()
    .min(1, "Down payment is required")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a non-negative number"),
  annual_income: z.string()
    .min(1, "Annual income is required")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, "Must be a positive number"),
  credit_score_range: z.enum(["below_600", "600-649", "650-699", "700-749", "750+"]),
  
  // Property Preferences
  property_types: z.array(z.string()).min(1, "Select at least one property type"),
  preferred_locations: z.array(z.string()).min(1, "Select at least one location"),
  min_bedrooms: z.number().min(0).max(10),
  purchase_timeline: z.enum(["0-3 months", "3-6 months", "6-12 months", "12+ months"]),
  
  // Co-Ownership Preferences
  ownership_split: z.enum(["50/50", "60/40", "70/30", "flexible"]),
  living_arrangements: z.array(z.string()).min(1, "Select at least one living arrangement"),
  co_ownership_purposes: z.array(z.string()).min(1, "Select at least one purpose"),
  
  // About You
  age_range: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]),
  occupation: z.string().min(1, "Occupation is required").max(100),
  why_co_ownership: z.string().max(500, "Maximum 500 characters allowed"),
}).refine(
  data => Number(data.budget_min) <= Number(data.budget_max),
  {
    message: "Minimum budget must be less than or equal to maximum budget",
    path: ["budget_min"],
  }
);
```

## Data Models

### Co-Ownership Profile Table

```sql
CREATE TABLE IF NOT EXISTS public.co_ownership_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Financial Capacity
    budget_min NUMERIC(12, 2),
    budget_max NUMERIC(12, 2),
    down_payment NUMERIC(12, 2),
    annual_income NUMERIC(12, 2),
    credit_score_range TEXT,
    
    -- Property Preferences
    property_types TEXT[],
    preferred_locations TEXT[],
    min_bedrooms INTEGER,
    purchase_timeline TEXT,
    
    -- Co-Ownership Preferences
    ownership_split TEXT,
    living_arrangements TEXT[],
    co_ownership_purposes TEXT[],
    
    -- About You
    age_range TEXT,
    occupation TEXT,
    why_co_ownership TEXT,
    
    -- Metadata
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CHECK (budget_min >= 0),
    CHECK (budget_max >= 0),
    CHECK (budget_min <= budget_max),
    CHECK (down_payment >= 0),
    CHECK (annual_income >= 0),
    CHECK (min_bedrooms >= 0 AND min_bedrooms <= 10),
    CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    CHECK (LENGTH(why_co_ownership) <= 500)
);

-- Indexes
CREATE INDEX idx_co_ownership_profiles_user_id ON public.co_ownership_profiles(user_id);
CREATE INDEX idx_co_ownership_profiles_completeness ON public.co_ownership_profiles(profile_completeness);
CREATE INDEX idx_co_ownership_profiles_budget ON public.co_ownership_profiles(budget_min, budget_max);

-- RLS Policies
ALTER TABLE public.co_ownership_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_co_ownership_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER co_ownership_profiles_updated_at
    BEFORE UPDATE ON public.co_ownership_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_co_ownership_profiles_updated_at();
```

### Profile Completeness Calculation

The profile completeness is calculated based on the following weighted fields:

```typescript
function calculateProfileCompleteness(profile: Partial<CoOwnershipProfile>): number {
  const fields = [
    // Financial Capacity (25% weight - 5 fields)
    { key: 'budget_min', weight: 5 },
    { key: 'budget_max', weight: 5 },
    { key: 'down_payment', weight: 5 },
    { key: 'annual_income', weight: 5 },
    { key: 'credit_score_range', weight: 5 },
    
    // Property Preferences (25% weight - 4 fields)
    { key: 'property_types', weight: 6.25, isArray: true },
    { key: 'preferred_locations', weight: 6.25, isArray: true },
    { key: 'min_bedrooms', weight: 6.25 },
    { key: 'purchase_timeline', weight: 6.25 },
    
    // Co-Ownership Preferences (25% weight - 3 fields)
    { key: 'ownership_split', weight: 8.33 },
    { key: 'living_arrangements', weight: 8.33, isArray: true },
    { key: 'co_ownership_purposes', weight: 8.34, isArray: true },
    
    // About You (25% weight - 3 fields)
    { key: 'age_range', weight: 8.33 },
    { key: 'occupation', weight: 8.33 },
    { key: 'why_co_ownership', weight: 8.34 },
  ];
  
  let totalWeight = 0;
  
  for (const field of fields) {
    const value = profile[field.key as keyof CoOwnershipProfile];
    
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) {
        totalWeight += field.weight;
      }
    } else {
      if (value !== null && value !== undefined && value !== '') {
        totalWeight += field.weight;
      }
    }
  }
  
  return Math.round(totalWeight);
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Profile Data Round-Trip Consistency

*For any* valid co-ownership profile data, saving the profile to the database and then loading it should return data equivalent to the original input.

**Validates: Requirements 1.2, 1.4**

### Property 2: Budget Range Validation

*For any* budget values where minimum budget is greater than maximum budget, the validation system should reject the input and display an error message.

**Validates: Requirements 2.5**

### Property 3: Financial Field Format Validation

*For any* non