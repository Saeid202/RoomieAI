# Co-Ownership Profile - Execution Plan

## Overview
Build a Co-Ownership Profile feature that allows seekers to create a general co-buyer matching profile, independent of specific properties. This sits beside the Co-Buying Scenario page in the Buying Opportunities section.

---

## 📊 Phase Breakdown

### **Phase 1: Foundation (Database + Types)**
**Goal**: Set up the data layer and type system
**Time**: ~2-3 hours

**What we do**:
1. Create database migration for `co_ownership_profiles` table
   - All fields (financial, property prefs, co-ownership prefs, personal info)
   - RLS policies (users can only access their own profile)
   - Indexes for performance
   - Constraints for data validation
   - Triggers for `updated_at` timestamp

2. Create TypeScript types
   - `CoOwnershipProfile` interface
   - `CoOwnershipProfileFormData` interface
   - Validation schemas using Zod
   - Enums for dropdowns (credit score ranges, timelines, etc.)

**Deliverables**:
- `supabase/migrations/20260301_create_co_ownership_profiles.sql`
- `src/types/coOwnershipProfile.ts`

---

### **Phase 2: Service Layer**
**Goal**: Build the API communication layer
**Time**: ~2-3 hours

**What we do**:
1. Create service file with functions:
   - `getProfile(userId)` - Fetch user's profile
   - `createProfile(data)` - Create new profile
   - `updateProfile(id, data)` - Update existing profile
   - `deleteProfile(id)` - Delete profile (optional)
   - `calculateCompleteness(data)` - Calculate profile completion percentage

2. Add error handling and retry logic
3. Add TypeScript types for service responses

**Deliverables**:
- `src/services/coOwnershipProfileService.ts`

---

### **Phase 3: UI Components (Form Sections)**
**Goal**: Build reusable form section components
**Time**: ~4-5 hours

**What we do**:
1. Create component directory structure
2. Build individual section components:
   - `FinancialCapacitySection.tsx` - Budget, down payment, income, credit score
   - `PropertyPreferencesSection.tsx` - Property types, locations, bedrooms, timeline
   - `CoOwnershipPrefsSection.tsx` - Ownership split, living arrangement, purpose
   - `PersonalInfoSection.tsx` - Age range, occupation, why co-ownership
   - `ProfileCompletenessBar.tsx` - Progress indicator with visual feedback

3. Apply styling from `FORM_STYLING_GUIDE.md`
4. Add inline validation
5. Make responsive (mobile-friendly)

**Deliverables**:
- `src/components/co-ownership/FinancialCapacitySection.tsx`
- `src/components/co-ownership/PropertyPreferencesSection.tsx`
- `src/components/co-ownership/CoOwnershipPrefsSection.tsx`
- `src/components/co-ownership/PersonalInfoSection.tsx`
- `src/components/co-ownership/ProfileCompletenessBar.tsx`

---

### **Phase 4: Main Page Component**
**Goal**: Assemble everything into the main page
**Time**: ~3-4 hours

**What we do**:
1. Create main page component `CoOwnershipProfile.tsx`
2. Integrate all section components
3. Add form state management (React Hook Form)
4. Implement save/update logic
5. Add loading states
6. Add success/error messages (toast notifications)
7. Handle empty state (first-time users)
8. Handle existing profile loading

**Deliverables**:
- `src/pages/dashboard/CoOwnershipProfile.tsx`

---

### **Phase 5: Navigation Integration**
**Goal**: Make the page accessible from the dashboard
**Time**: ~1 hour

**What we do**:
1. Update `SeekerSidebar.tsx` to add new navigation link
2. Add route in `App.tsx` or routing config
3. Add icon (UserPlus or Users)
4. Position beside "Co-Buying Scenario" link
5. Add active state highlighting

**Deliverables**:
- Updated `src/components/dashboard/sidebar/SeekerSidebar.tsx`
- Updated routing configuration

---

### **Phase 6: Testing & Polish**
**Goal**: Ensure everything works smoothly
**Time**: ~2-3 hours

**What we do**:
1. Test database operations (create, read, update)
2. Test RLS policies (users can't access other profiles)
3. Test form validation (all edge cases)
4. Test profile completeness calculation
5. Test mobile responsiveness
6. Test error handling
7. Fix any bugs found
8. Polish UI/UX details

**Deliverables**:
- Bug-free, production-ready feature

---

## 📋 Total Summary

**Total Phases**: 6
**Estimated Time**: 14-18 hours (2-3 days)

**Phase Order**:
1. Foundation (Database + Types) → 2-3 hours
2. Service Layer → 2-3 hours
3. UI Components → 4-5 hours
4. Main Page → 3-4 hours
5. Navigation → 1 hour
6. Testing & Polish → 2-3 hours

---

## 🎯 Key Features Delivered

After completion, users will be able to:
- ✅ Create a co-ownership profile
- ✅ Edit their existing profile
- ✅ See profile completeness percentage
- ✅ Get real-time validation feedback
- ✅ Save profile data securely (RLS protected)
- ✅ Access from Buying Opportunities section
- ✅ Use on mobile devices

---

## 🔒 Security & Data Protection

- RLS policies ensure users only access their own data
- Form validation prevents invalid data
- Database constraints enforce data integrity
- Sensitive financial data properly handled

---

## 📱 Responsive Design

- Mobile-first approach
- Single column on mobile (<768px)
- Multi-column on desktop (≥768px)
- Touch-friendly buttons (44x44px minimum)

---

## 🎨 UI/UX Highlights

- Gradient backgrounds matching co-ownership theme
- Clear section headers with icons
- Inline validation with helpful messages
- Profile completeness bar with visual feedback
- Success/error toast notifications
- Loading states for better UX

---

## 🚀 Ready to Start?

Once you approve this plan, we'll execute phase by phase. Each phase builds on the previous one, so we'll go in order:

**Phase 1** → **Phase 2** → **Phase 3** → **Phase 4** → **Phase 5** → **Phase 6**

After each phase, I'll confirm completion before moving to the next.

---

**Status**: ⏸️ Awaiting approval to begin
**Next Step**: Phase 1 - Foundation (Database + Types)
