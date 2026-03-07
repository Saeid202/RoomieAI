# Co-Ownership Profile - Implementation Plan

## Overview
Create a Co-Ownership Profile feature that allows users to create a general co-buyer profile for matching with compatible partners, independent of specific properties.

---

## 📍 Location in UI

**Placement**: New tab/page beside "Co-Buying Scenario" in Buying Opportunities section

**Navigation Structure**:
```
Buying Opportunities (sidebar)
├── Co-Buying Scenario (existing)
└── Co-Ownership Profile (NEW)
```

---

## 🎯 Phase 1: Basic Info Box (MVP)

### UI Layout

**Page Structure**:
```
┌─────────────────────────────────────────────┐
│  Co-Ownership Profile                       │
│  ─────────────────────────────────────────  │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  📋 Basic Information                 │ │
│  │  ─────────────────────────────────── │ │
│  │                                       │ │
│  │  [Form fields here]                   │ │
│  │                                       │ │
│  │  [Save Profile Button]                │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Status: ✅ Profile Complete / ⚠️ Incomplete│
└─────────────────────────────────────────────┘
```

### Basic Info Box Fields

**Section 1: Financial Capacity**
- Budget Range (min-max slider)
  - Min: $100K, Max: $2M
  - Step: $25K
- Down Payment Available
  - Input: Dollar amount
- Monthly Income Range
  - Dropdown: <$3K, $3K-$5K, $5K-$7K, $7K-$10K, $10K+
- Credit Score Range
  - Dropdown: Excellent (750+), Good (700-749), Fair (650-699), Building (<650)

**Section 2: Property Preferences**
- Property Type (multi-select)
  - Condo, Townhouse, Semi-Detached, Detached, Multi-Unit
- Preferred Locations (multi-select with autocomplete)
  - Cities/neighborhoods
- Bedrooms
  - Dropdown: 1, 2, 3, 4, 5+
- Timeline to Purchase
  - Dropdown: Immediately, 1-3 months, 3-6 months, 6-12 months, 1+ years

**Section 3: Co-Ownership Preferences**
- Ownership Split Preference
  - Dropdown: 50/50, 60/40, 70/30, 80/20, Flexible
- Living Arrangement
  - Radio: Both live there, Investment only, One lives/one invests, Flexible
- Purpose
  - Radio: Primary residence, Investment property, Vacation home, Mixed

**Section 4: About You**
- Age Range
  - Dropdown: 18-25, 26-35, 36-45, 46-55, 56+
- Occupation
  - Text input
- Why Co-Ownership? (optional)
  - Textarea: Brief description

---

## 🗄️ Database Schema

### New Table: `co_ownership_profiles`

```sql
CREATE TABLE co_ownership_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Financial
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  down_payment_available INTEGER,
  monthly_income_range TEXT,
  credit_score_range TEXT,
  
  -- Property Preferences
  property_types TEXT[], -- Array of property types
  preferred_locations TEXT[], -- Array of cities/neighborhoods
  bedrooms INTEGER,
  timeline_to_purchase TEXT,
  
  -- Co-Ownership Preferences
  ownership_split_preference TEXT,
  living_arrangement TEXT,
  purpose TEXT,
  
  -- Personal
  age_range TEXT,
  occupation TEXT,
  why_coownership TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  profile_completeness INTEGER DEFAULT 0, -- Percentage 0-100
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id), -- One profile per user
  CHECK (budget_min <= budget_max),
  CHECK (profile_completeness >= 0 AND profile_completeness <= 100)
);

-- RLS Policies
ALTER TABLE co_ownership_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own co-ownership profile"
  ON co_ownership_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own co-ownership profile"
  ON co_ownership_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own co-ownership profile"
  ON co_ownership_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own co-ownership profile"
  ON co_ownership_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_co_ownership_profiles_user_id ON co_ownership_profiles(user_id);
CREATE INDEX idx_co_ownership_profiles_is_active ON co_ownership_profiles(is_active);
CREATE INDEX idx_co_ownership_profiles_budget ON co_ownership_profiles(budget_min, budget_max);
CREATE INDEX idx_co_ownership_profiles_locations ON co_ownership_profiles USING GIN(preferred_locations);

-- Updated at trigger
CREATE TRIGGER update_co_ownership_profiles_updated_at
  BEFORE UPDATE ON co_ownership_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📁 File Structure

### New Files to Create:

```
src/
├── pages/
│   └── dashboard/
│       └── CoOwnershipProfile.tsx          (NEW - Main page)
│
├── components/
│   └── co-ownership/
│       ├── CoOwnershipProfileForm.tsx      (NEW - Form component)
│       ├── FinancialInfoSection.tsx        (NEW - Financial fields)
│       ├── PropertyPreferencesSection.tsx  (NEW - Property fields)
│       ├── CoOwnershipPrefsSection.tsx     (NEW - Co-ownership fields)
│       ├── PersonalInfoSection.tsx         (NEW - Personal fields)
│       └── ProfileCompletenessBar.tsx      (NEW - Progress indicator)
│
├── services/
│   └── coOwnershipProfileService.ts        (NEW - API calls)
│
├── types/
│   └── coOwnershipProfile.ts               (NEW - TypeScript types)
│
└── hooks/
    └── useCoOwnershipProfile.ts            (NEW - Custom hook)
```

---

## 🔧 Implementation Steps

### Step 1: Database Setup
1. Create migration file: `20260301_create_co_ownership_profiles.sql`
2. Run migration in Supabase
3. Verify table and policies created

### Step 2: TypeScript Types
Create `src/types/coOwnershipProfile.ts`:
```typescript
export interface CoOwnershipProfile {
  id: string;
  user_id: string;
  budget_min: number;
  budget_max: number;
  down_payment_available?: number;
  monthly_income_range?: string;
  credit_score_range?: string;
  property_types: string[];
  preferred_locations: string[];
  bedrooms?: number;
  timeline_to_purchase?: string;
  ownership_split_preference?: string;
  living_arrangement?: string;
  purpose?: string;
  age_range?: string;
  occupation?: string;
  why_coownership?: string;
  is_active: boolean;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}
```

### Step 3: Service Layer
Create `src/services/coOwnershipProfileService.ts`:
- `getProfile(userId)` - Fetch user's profile
- `createProfile(data)` - Create new profile
- `updateProfile(id, data)` - Update existing profile
- `deleteProfile(id)` - Delete profile
- `calculateCompleteness(data)` - Calculate profile completion %

### Step 4: UI Components
Create form sections with proper validation and styling

### Step 5: Main Page
Create `src/pages/dashboard/CoOwnershipProfile.tsx`:
- Load existing profile or show empty form
- Handle save/update
- Show completeness indicator
- Success/error messages

### Step 6: Navigation
Update sidebar to include new page:
- Add "Co-Ownership Profile" link under Buying Opportunities
- Add icon (UserPlus or Users)

---

## 🎨 UI Design Specs

### Color Scheme
- Primary: Purple/Blue gradient (matching existing co-ownership theme)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Info: Blue (#3B82F6)

### Form Styling
- Use existing form components from `FORM_STYLING_GUIDE.md`
- Gradient backgrounds for sections
- Clear section headers with icons
- Inline validation
- Responsive design (mobile-friendly)

### Profile Completeness Bar
```
┌─────────────────────────────────────┐
│ Profile Completeness: 75%           │
│ ████████████████░░░░░░░░            │
│ ✅ Financial Info                   │
│ ✅ Property Preferences             │
│ ⚠️  Co-Ownership Preferences        │
│ ❌ Personal Info                    │
└─────────────────────────────────────┘
```

---

## 🔄 Future Enhancements (Phase 2+)

### Matching Algorithm
- Find compatible co-buyers based on:
  - Budget overlap
  - Location preferences
  - Timeline alignment
  - Ownership split compatibility
  - Living arrangement match

### Profile Visibility
- Public/Private toggle
- Share profile link
- Browse other profiles

### Communication
- In-app messaging
- Connection requests
- Meeting scheduler

### Verification
- Income verification
- Credit check integration
- ID verification

---

## ✅ Acceptance Criteria

### Must Have (Phase 1):
- [ ] User can create co-ownership profile
- [ ] User can edit existing profile
- [ ] User can view their profile
- [ ] Profile completeness calculated automatically
- [ ] Form validation works correctly
- [ ] Data persists in database
- [ ] RLS policies protect user data
- [ ] Mobile responsive design
- [ ] Success/error messages display

### Nice to Have (Future):
- [ ] Profile preview mode
- [ ] Export profile as PDF
- [ ] Profile sharing
- [ ] Matching suggestions
- [ ] Profile analytics

---

## 📊 Success Metrics

- Profile creation rate
- Profile completion rate
- Time to complete profile
- Profile update frequency
- User satisfaction score

---

## 🚀 Deployment Checklist

- [ ] Database migration tested
- [ ] RLS policies verified
- [ ] TypeScript types defined
- [ ] Service layer implemented
- [ ] UI components created
- [ ] Form validation tested
- [ ] Mobile responsiveness checked
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Success messages configured
- [ ] Navigation updated
- [ ] Documentation updated

---

## 📝 Notes

- Keep form simple and user-friendly
- Use progressive disclosure (show advanced options on demand)
- Provide helpful tooltips and examples
- Auto-save drafts to prevent data loss
- Show estimated time to complete
- Celebrate profile completion with animation

---

**Status**: Ready for implementation
**Priority**: High
**Estimated Time**: 2-3 days for Phase 1
