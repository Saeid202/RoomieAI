# Lender Role - Implementation Tasks

- [x] 1. Create database migration for lender tables
- [x] 2. Update user_profiles role enum to include 'lender'
- [x] 3. Create TypeScript types for lender
- [x] 4. Create lender service functions
- [x] 5. Create LenderDashboard page
- [x] 6. Create LenderProfile page
- [x] 7. Create LenderRates page
- [x] 8. Create LenderRequests page
- [x] 9. Create LenderLayout wrapper
- [x] 10. Create LenderRateCard component
- [x] 11. Create LenderProfileCard component
- [x] 12. Update signup page to include 'lender' role
- [x] 13. Update navigation to show lender dashboard
- [x] 14. Add RLS policies for new tables

## Task Details

### 1. Create database migration for lender tables

**File**: `supabase/migrations/{date}_create_lender_tables.sql`

Create:
- `lender_profiles` table
- `lender_rates` table
- `lender_rate_history` table
- Update `mortgage_profiles` with lender fields

### 2. Update user_profiles role enum to include 'lender'

**File**: `supabase/migrations/{date}_add_lender_to_user_role.sql`

Add 'lender' value to user_role enum type.

### 3. Create TypeScript types for lender

**File**: `src/types/lender.ts`

```typescript
export interface LenderProfile {
  id: string;
  user_id: string;
  company_name: string;
  // ... other fields
}

export interface LenderRate {
  id: string;
  lender_id: string;
  loan_type: string;
  term_years: number;
  interest_rate: number;
  // ... other fields
}
```

### 4. Create lender service functions

**File**: `src/services/lenderService.ts`

Functions:
- `getLenderProfile(userId)`
- `createLenderProfile(input)`
- `updateLenderProfile(profileId, updates)`
- `getLenderRates(lenderId)`
- `createLenderRate(input)`
- `getActiveLenders()`
- `getActiveRates()`

### 5. Create LenderDashboard page

**File**: `src/pages/dashboard/lender/LenderDashboard.tsx`

Components:
- Stats cards (active rates, pending requests, quotes sent)
- Recent activity section
- Quick actions

### 6. Create LenderProfile page

**File**: `src/pages/dashboard/lender/LenderProfile.tsx`

Features:
- Company information form
- Contact details
- License information
- Company description

### 7. Create LenderRates page

**File**: `src/pages/dashboard/lender/LenderRates.tsx`

Features:
- List of current rates
- Add new rate form
- Edit existing rates
- Rate history

### 8. Create LenderRequests page

**File**: `src/pages/dashboard/lender/LenderRequests.tsx`

Features:
- List of mortgage profiles with consent
- View seeker details
- Provide rate quotes
- Track quote status

### 9. Create LenderLayout wrapper

**File**: `src/pages/dashboard/lender/LenderLayout.tsx`

Layout with:
- Side navigation
- Header
- Content area

### 10. Create LenderRateCard component

**File**: `src/components/lender/LenderRateCard.tsx`

Display rate information:
- Loan type
- Interest rate
- APR
- Term
- Edit/Delete buttons

### 11. Create LenderProfileCard component

**File**: `src/components/lender/LenderProfileCard.tsx`

Public profile card for display:
- Company logo
- Company name
- Contact info
- Active rates

### 12. Update signup page to include 'lender' role

**File**: `src/pages/auth/Signup.tsx` (or similar)

Add 'lender' to the role selection dropdown.

### 13. Update navigation to show lender dashboard

**File**: `src/components/layout/Navigation.tsx` (or similar)

Add condition to show `/dashboard/lender` for users with 'lender' role.

### 14. Add RLS policies for new tables

**File**: `supabase/migrations/{date}_add_lender_rls_policies.sql`

RLS policies for:
- `lender_profiles` - owner access + public view for verified/active
- `lender_rates` - owner access + public view for active rates