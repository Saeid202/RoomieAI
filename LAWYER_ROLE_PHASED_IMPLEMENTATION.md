# Lawyer Role - Phased Implementation Plan

## 🎯 OVERVIEW
Implement Lawyer role in 3 manageable phases, each independently testable and deployable.

**Total Estimated Time**: 12-16 hours
**Phases**: 3 phases
**Approach**: Build → Test → Deploy per phase

---

## 📊 PHASE BREAKDOWN

```
PHASE 1: Core Foundation (MVP)           ⏱️ 5-6 hours   ✅ Testable
├─ Database setup
├─ Basic profile management
├─ Dashboard & routing
└─ Signup integration

PHASE 2: Client Management               ⏱️ 4-5 hours   ✅ Testable
├─ Client-lawyer relationships
├─ Case tracking
├─ Client list & details
└─ Status management

PHASE 3: Advanced Features               ⏱️ 3-5 hours   ✅ Testable
├─ Document management
├─ Public lawyer directory
├─ Consultation booking
└─ Messaging integration
```

---

# PHASE 1: CORE FOUNDATION (MVP)
**Goal**: Get lawyer role working with basic profile and dashboard
**Time**: 5-6 hours
**Deliverable**: Lawyers can sign up, login, and manage their profile

## 1.1 Database Setup (1.5 hours)

### Step 1: Add Lawyer Role
**File**: `supabase/migrations/20260306_add_lawyer_role.sql`
```sql
-- Add lawyer to role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lawyer';

-- Update RLS policies for lawyer role
-- (Copy pattern from mortgage_broker policies)
```

### Step 2: Create Lawyer Profiles Table
**File**: `supabase/migrations/20260306_create_lawyer_profiles.sql`
```sql
CREATE TABLE lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  law_firm_name TEXT,
  bar_association_number TEXT,
  practice_areas TEXT[],
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  consultation_fee DECIMAL(10,2),
  bio TEXT,
  city TEXT,
  province TEXT,
  is_accepting_clients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can view own profile"
  ON lawyer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can update own profile"
  ON lawyer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can insert own profile"
  ON lawyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view (for directory in Phase 3)
CREATE POLICY "Public can view lawyer profiles"
  ON lawyer_profiles FOR SELECT
  USING (true);
```

**Test**: Run migrations, verify table created, test RLS policies

---

## 1.2 TypeScript Types & Service (1 hour)

### Step 3: Create Types
**File**: `src/types/lawyer.ts`
```typescript
export interface LawyerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  law_firm_name: string | null;
  bar_association_number: string | null;
  practice_areas: string[] | null;
  years_of_experience: number | null;
  hourly_rate: number | null;
  consultation_fee: number | null;
  bio: string | null;
  city: string | null;
  province: string | null;
  is_accepting_clients: boolean;
  created_at: string;
  updated_at: string;
}

export interface LawyerFormData {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  law_firm_name?: string | null;
  bar_association_number?: string | null;
  practice_areas?: string[] | null;
  years_of_experience?: number | null;
  hourly_rate?: number | null;
  consultation_fee?: number | null;
  bio?: string | null;
  city?: string | null;
  province?: string | null;
  is_accepting_clients?: boolean;
}

export const PRACTICE_AREAS = [
  'Landlord-Tenant Law',
  'Real Estate Law',
  'Property Disputes',
  'Lease Agreements',
  'Eviction Proceedings',
  'Housing Rights'
] as const;
```

### Step 4: Create Service
**File**: `src/services/lawyerService.ts`
```typescript
import { supabase } from "@/integrations/supabase/client";
import { LawyerProfile, LawyerFormData } from "@/types/lawyer";

export async function fetchLawyerProfile(userId: string): Promise<LawyerProfile | null> {
  const { data, error } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching lawyer profile:", error);
    return null;
  }
  return data;
}

export async function updateLawyerProfile(
  userId: string,
  profileData: LawyerFormData
): Promise<LawyerProfile | null> {
  const { data, error } = await supabase
    .from("lawyer_profiles")
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating lawyer profile:", error);
    throw error;
  }
  return data;
}
```

**Test**: Import types, call service functions

---

## 1.3 UI Components (2 hours)

### Step 5: Lawyer Dashboard
**File**: `src/pages/dashboard/LawyerDashboard.tsx`
- Copy structure from `MortgageBrokerDashboard.tsx`
- Welcome banner
- Stats cards (placeholder data for now)
- Quick action cards (Profile, Settings)

### Step 6: Lawyer Profile Page
**File**: `src/pages/dashboard/LawyerProfile.tsx`
- Copy structure from `MortgageBrokerProfile.tsx`
- Form fields for all profile data
- Practice areas multi-select
- Save functionality

### Step 7: Lawyer Sidebar
**File**: `src/components/dashboard/sidebar/LawyerSidebar.tsx`
```typescript
export function LawyerSidebar({ isActive, showLabels }: Props) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏠</span>}
        label="Dashboard"
        to="/dashboard/lawyer"
        isActive={isActive('/dashboard/lawyer')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👤</span>}
        label="Profile"
        to="/dashboard/lawyer/profile"
        isActive={isActive('/dashboard/lawyer/profile')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">⚙️</span>}
        label="Settings"
        to="/dashboard/settings"
        isActive={isActive('/dashboard/settings')}
      />
    </>
  );
}
```

**Test**: View dashboard, edit profile, navigate sidebar

---

## 1.4 Routing & Auth (1 hour)

### Step 8: Update Dashboard Routing
**File**: `src/pages/Dashboard.tsx`
```typescript
// Add lawyer redirect
else if (effectiveRole === 'lawyer') {
  return <Navigate to="/dashboard/lawyer" replace />;
}
```

### Step 9: Add Routes
**File**: `src/App.tsx`
```typescript
{/* Lawyer routes */}
<Route path="lawyer" element={<LawyerDashboard />} />
<Route path="lawyer/profile" element={<LawyerProfile />} />
```

### Step 10: Update Sidebar
**File**: `src/components/dashboard/DashboardSidebar.tsx`
```typescript
{role === 'lawyer' && (
  <LawyerSidebar isActive={isActive} showLabels={showLabels} />
)}
```

### Step 11: Update Signup Form
**File**: `src/components/auth/SignupForm.tsx`
```typescript
// Add to enum
role: z.enum(["seeker", "landlord", "renovator", "mortgage_broker", "lawyer"])

// Add radio button
<FormItem>
  <RadioGroupItem value="lawyer" />
  <FormLabel>Lawyer - Provide legal services</FormLabel>
</FormItem>
```

### Step 12: Update Route Guard
**File**: `src/components/dashboard/RouteGuard.tsx`
```typescript
const lawyerRoutes = ['/dashboard/lawyer'];
if (lawyerRoutes.some(route => pathname.startsWith(route)) && role !== 'lawyer') {
  return <Navigate to="/dashboard" replace />;
}
```

**Test**: Sign up as lawyer, login, access dashboard, verify routing

---

## ✅ PHASE 1 TESTING CHECKLIST

- [ ] Database migrations run successfully
- [ ] Lawyer role appears in signup form
- [ ] Can sign up as lawyer
- [ ] Can login as lawyer
- [ ] Redirects to `/dashboard/lawyer`
- [ ] Dashboard displays correctly
- [ ] Can navigate to profile page
- [ ] Can edit and save profile
- [ ] Sidebar shows correct menu items
- [ ] Route guard blocks non-lawyers
- [ ] Mobile responsive

**Deliverable**: Working lawyer signup, login, dashboard, and profile management

---

# PHASE 2: CLIENT MANAGEMENT
**Goal**: Lawyers can manage clients and cases
**Time**: 4-5 hours
**Deliverable**: Full client relationship and case tracking system

## 2.1 Database Setup (1.5 hours)

### Step 13: Client Relationships Table
**File**: `supabase/migrations/20260307_create_lawyer_client_relationships.sql`
```sql
CREATE TABLE lawyer_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES lawyer_profiles(user_id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT NOT NULL,
  case_description TEXT,
  status TEXT DEFAULT 'pending',
  consultation_date TIMESTAMPTZ,
  retainer_paid BOOLEAN DEFAULT false,
  retainer_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lawyer_id, client_id, case_type)
);

-- RLS Policies
ALTER TABLE lawyer_client_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can view their clients"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can view their lawyers"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can manage relationships"
  ON lawyer_client_relationships FOR ALL
  USING (auth.uid() = lawyer_id);
```

**Test**: Create test relationships, verify RLS

---

## 2.2 Service Layer (1 hour)

### Step 14: Update Lawyer Service
**File**: `src/services/lawyerService.ts`
```typescript
export async function fetchLawyerClients(
  lawyerId: string
): Promise<LawyerClientRelationship[]> {
  const { data, error } = await supabase
    .from("lawyer_client_relationships")
    .select(`
      *,
      client:client_id (
        email,
        user_metadata
      )
    `)
    .eq("lawyer_id", lawyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data;
}

export async function createClientRelationship(
  lawyerId: string,
  clientId: string,
  caseType: string,
  caseDescription?: string
) {
  // Implementation
}

export async function updateCaseStatus(
  relationshipId: string,
  status: string
) {
  // Implementation
}
```

**Test**: Fetch clients, create relationships, update status

---

## 2.3 UI Components (1.5 hours)

### Step 15: Clients Page
**File**: `src/pages/dashboard/LawyerClients.tsx`
- Client list with search/filter
- Client cards showing case details
- Status badges
- Action buttons

### Step 16: Client Card Component
**File**: `src/components/lawyer/ClientCard.tsx`
- Display client info
- Case type and description
- Status indicator
- Action buttons (View, Message, Update)

### Step 17: Case Details Modal
**File**: `src/components/lawyer/CaseDetailsModal.tsx`
- Full case information
- Edit case details
- Update status
- Add notes

**Test**: View clients, filter list, open details, update status

---

## 2.4 Integration (30 min)

### Step 18: Update Dashboard
- Add client count to stats
- Show recent clients
- Link to clients page

### Step 19: Update Sidebar
- Add "Clients" menu item

### Step 20: Add Routes
```typescript
<Route path="lawyer/clients" element={<LawyerClients />} />
```

**Test**: Navigate to clients, view from dashboard

---

## ✅ PHASE 2 TESTING CHECKLIST

- [ ] Can create client relationships
- [ ] Client list displays correctly
- [ ] Can search/filter clients
- [ ] Can view client details
- [ ] Can update case status
- [ ] Can add case notes
- [ ] Dashboard shows client stats
- [ ] Recent clients appear on dashboard
- [ ] Mobile responsive

**Deliverable**: Complete client and case management system

---

# PHASE 3: ADVANCED FEATURES
**Goal**: Document management, public directory, booking
**Time**: 3-5 hours
**Deliverable**: Full-featured lawyer platform

## 3.1 Document Management (1.5 hours)

### Step 21: Documents Table & Storage
**File**: `supabase/migrations/20260308_create_lawyer_documents.sql`
- Create `lawyer_documents` table
- Create `lawyer-documents` storage bucket
- Set up RLS policies

### Step 22: Document Service
**File**: `src/services/lawyerDocumentService.ts`
- Upload documents
- Fetch documents
- Delete documents
- Generate signed URLs

### Step 23: Document UI
**File**: `src/components/lawyer/DocumentUploadModal.tsx`
- Upload interface
- Document list
- Download/view documents

**Test**: Upload, view, download documents

---

## 3.2 Public Directory (1 hour)

### Step 24: Find Lawyer Page
**File**: `src/pages/dashboard/FindLawyer.tsx`
- Browse all lawyers
- Filter by practice area, city
- View lawyer profiles
- Request consultation button

### Step 25: Add Route
```typescript
<Route path="find-lawyer" element={<FindLawyer />} />
```

**Test**: Browse lawyers, filter, view profiles

---

## 3.3 Consultation Booking (1 hour)

### Step 26: Booking Modal
**File**: `src/components/lawyer/ConsultationBookingModal.tsx`
- Select date/time
- Enter case details
- Submit request

### Step 27: Integration
- Add booking to client relationships
- Email notifications
- Calendar integration (optional)

**Test**: Book consultation, verify in database

---

## 3.4 Messaging Integration (30 min)

### Step 28: Update Chats
- Enable lawyer-client messaging
- Show active conversations
- Document sharing in chat

**Test**: Send messages between lawyer and client

---

## ✅ PHASE 3 TESTING CHECKLIST

- [ ] Can upload documents
- [ ] Can view/download documents
- [ ] Document security works (RLS)
- [ ] Public directory displays lawyers
- [ ] Can filter lawyer directory
- [ ] Can request consultation
- [ ] Lawyer receives booking notification
- [ ] Messaging works between lawyer-client
- [ ] Can share documents in chat
- [ ] Mobile responsive

**Deliverable**: Complete lawyer platform with all features

---

# 📋 IMPLEMENTATION STRATEGY

## How to Execute Each Phase

### 1. Start Phase
- Read phase documentation
- Review all steps in phase
- Prepare development environment

### 2. Execute Steps Sequentially
- Complete each step fully
- Test after each step
- Fix issues before moving forward

### 3. Phase Testing
- Run full phase test checklist
- Test on mobile
- Test all user flows

### 4. Phase Deployment
- Commit code
- Run migrations
- Deploy to staging
- Test in staging
- Deploy to production

### 5. Move to Next Phase
- Only after current phase is 100% complete
- Document any issues or learnings

---

# 🎯 SUCCESS CRITERIA

## Phase 1 Success
✅ Lawyer can sign up and login
✅ Dashboard displays correctly
✅ Profile can be edited and saved
✅ Routing works correctly

## Phase 2 Success
✅ Lawyers can add clients
✅ Cases can be tracked
✅ Status updates work
✅ Client list is functional

## Phase 3 Success
✅ Documents can be uploaded/viewed
✅ Public directory works
✅ Consultations can be booked
✅ Messaging is integrated

---

# 📊 PROGRESS TRACKING

```
PHASE 1: Core Foundation
├─ [  ] 1.1 Database Setup
├─ [  ] 1.2 Types & Service
├─ [  ] 1.3 UI Components
└─ [  ] 1.4 Routing & Auth

PHASE 2: Client Management
├─ [  ] 2.1 Database Setup
├─ [  ] 2.2 Service Layer
├─ [  ] 2.3 UI Components
└─ [  ] 2.4 Integration

PHASE 3: Advanced Features
├─ [  ] 3.1 Document Management
├─ [  ] 3.2 Public Directory
├─ [  ] 3.3 Consultation Booking
└─ [  ] 3.4 Messaging Integration
```

---

# 🚀 DEPLOYMENT NOTES

## After Each Phase
1. Run database migrations
2. Clear browser cache
3. Test signup flow
4. Test all new features
5. Verify mobile responsiveness
6. Check console for errors

## Production Deployment
- Deploy Phase 1 first, stabilize
- Deploy Phase 2 after Phase 1 is stable
- Deploy Phase 3 after Phase 2 is stable

---

**Status**: ✅ Plan Complete - Ready to Start Phase 1
**Next Action**: Begin Phase 1, Step 1 - Database Setup
**Estimated Total Time**: 12-16 hours across 3 phases
