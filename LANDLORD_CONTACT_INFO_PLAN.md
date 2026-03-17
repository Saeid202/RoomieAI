# Landlord Contact Information Implementation Plan

## Overview
Add landlord contact information fields to the landlord profile, mirroring the fields from the Ontario Standard Lease Form Section 3 (Contact Information).

## Fields to Add
- **Unit** (if applicable) - Optional
- **Street Number** - Required
- **Street Name** - Required
- **PO Box** (if applicable) - Optional
- **City/Town** - Required
- **Province** - Required
- **Postal Code** - Required

---

## Phase 1: Database Layer

### 1.1 Create Migration File
**File:** `supabase/migrations/20260316_add_landlord_contact_info.sql`

**Changes:**
- Add 7 new columns to `user_profiles` table:
  - `contact_unit` (TEXT, nullable)
  - `contact_street_number` (TEXT, not null)
  - `contact_street_name` (TEXT, not null)
  - `contact_po_box` (TEXT, nullable)
  - `contact_city_town` (TEXT, not null)
  - `contact_province` (TEXT, not null)
  - `contact_postal_code` (TEXT, not null)

**Rationale:**
- Store in `user_profiles` table (not `landlord_verifications`) because this is core profile data
- Use `contact_` prefix to distinguish from rental unit address fields
- Make required fields NOT NULL, optional fields nullable
- Add `updated_at` trigger to track changes

### 1.2 Update RLS Policies
- Ensure users can read/update their own contact information
- No additional policies needed (existing policies cover this)

---

## Phase 2: Backend/API Layer

### 2.1 Update TypeScript Types
**File:** `src/types/landlord.ts` (create if doesn't exist)

**Add:**
```typescript
interface LandlordContactInfo {
  contactUnit?: string;
  contactStreetNumber: string;
  contactStreetName: string;
  contactPoBox?: string;
  contactCityTown: string;
  contactProvince: string;
  contactPostalCode: string;
}

interface LandlordProfile extends LandlordContactInfo {
  id: string;
  fullName: string;
  email: string;
  // ... existing fields
}
```

### 2.2 Create Service Functions
**File:** `src/services/landlordService.ts` (create if doesn't exist)

**Functions:**
- `getLandlordContactInfo(userId: string)` - Fetch contact info
- `updateLandlordContactInfo(userId: string, data: LandlordContactInfo)` - Update contact info
- `validateContactInfo(data: LandlordContactInfo)` - Validate required fields

### 2.3 Update Supabase Client Queries
**File:** `src/pages/dashboard/landlord/Profile.tsx`

**Changes:**
- Update `loadProfileData()` to fetch contact info fields
- Update `onSubmit()` to save contact info fields
- Add validation for required fields

---

## Phase 3: Frontend Layer

### 3.1 Update Form Schema
**File:** `src/pages/dashboard/landlord/Profile.tsx`

**Update `profileSchema`:**
```typescript
const profileSchema = z.object({
  // ... existing fields
  contactUnit: z.string().optional(),
  contactStreetNumber: z.string().min(1, "Street number is required"),
  contactStreetName: z.string().min(1, "Street name is required"),
  contactPoBox: z.string().optional(),
  contactCityTown: z.string().min(1, "City/Town is required"),
  contactProvince: z.string().min(1, "Province is required"),
  contactPostalCode: z.string().min(1, "Postal code is required"),
});
```

### 3.2 Create Contact Information Card Component
**File:** `src/components/landlord/LandlordContactInfoCard.tsx` (new)

**Features:**
- Display contact information in a card format
- Match the Ontario Lease Form styling (Section 3)
- Show required field indicators (red asterisks)
- Responsive grid layout (1 column mobile, 2 columns desktop)

### 3.3 Update Profile Page
**File:** `src/pages/dashboard/landlord/Profile.tsx`

**Changes:**
- Add new "Contact Information" card section
- Place after "Personal Information" section
- Include all 7 fields with proper labels and validation
- Use RequiredLabel component for required fields (matching Ontario Lease Form)
- Add form state management for contact info fields

### 3.4 UI/UX Enhancements
- Use consistent styling with existing profile form
- Add helpful placeholder text (e.g., "e.g., Suite 200", "e.g., M5V 3A8")
- Show validation errors inline
- Add success toast notification on save
- Maintain responsive design (mobile-first)

---

## Phase 4: Integration Points

### 4.1 Ontario Lease Form Integration
- When landlord fills Ontario Lease Form, pre-populate Section 3 fields from profile
- Allow landlord to update profile from lease form if needed

### 4.2 Property Listing Integration
- Use landlord contact info as default for property listings
- Allow override per property if needed

### 4.3 Tenant Communication
- Display landlord contact info to tenants (with privacy controls)
- Use for lease agreement generation

---

## Implementation Checklist

### Database
- [ ] Create migration file with 7 new columns
- [ ] Add updated_at trigger
- [ ] Test migration on staging
- [ ] Verify RLS policies work correctly

### Backend
- [ ] Create/update TypeScript types
- [ ] Create landlordService.ts with CRUD functions
- [ ] Add validation logic
- [ ] Test API endpoints

### Frontend
- [ ] Update profileSchema with new fields
- [ ] Create LandlordContactInfoCard component
- [ ] Update Profile.tsx to include contact info section
- [ ] Add form state management
- [ ] Implement validation and error handling
- [ ] Test responsive design
- [ ] Test form submission and data persistence

### Testing
- [ ] Unit tests for validation functions
- [ ] Integration tests for API calls
- [ ] E2E tests for form submission
- [ ] Test on mobile/tablet/desktop
- [ ] Test with existing landlord data (migration safety)

---

## Data Migration Strategy

### For Existing Landlords
- New columns will be nullable/optional initially
- Existing landlords won't be affected
- Contact info will be empty until they update their profile
- No data loss or breaking changes

### Backward Compatibility
- Existing code continues to work
- New fields are optional in API responses
- Gradual rollout possible

---

## Timeline Estimate

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Database migration | 30 min |
| 2 | Backend services & types | 1 hour |
| 3 | Frontend form & UI | 2 hours |
| 4 | Testing & refinement | 1.5 hours |
| **Total** | | **4.5 hours** |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Migration fails | Test on staging first, have rollback plan |
| RLS policy issues | Verify policies before deployment |
| Form validation errors | Comprehensive testing with edge cases |
| Data inconsistency | Use transactions for updates |
| Mobile responsiveness | Test on multiple devices |

---

## Success Criteria

✅ Landlords can add/update contact information in profile
✅ Contact info is properly validated (required fields enforced)
✅ Data persists correctly in database
✅ Contact info pre-populates Ontario Lease Form Section 3
✅ No breaking changes to existing functionality
✅ Responsive design works on all devices
✅ All tests pass

---

## Future Enhancements

- [ ] Multiple contact addresses (primary, secondary)
- [ ] Contact info visibility settings (privacy controls)
- [ ] Auto-fill from property address
- [ ] Contact info templates
- [ ] Integration with CRM systems
