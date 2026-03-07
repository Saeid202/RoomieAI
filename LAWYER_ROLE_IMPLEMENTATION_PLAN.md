# Lawyer Role & Dashboard Implementation Plan

## Overview
Add a new "Lawyer" role to the platform with a dedicated dashboard, following the same pattern as the existing Mortgage Broker role implementation.

---

## PHASE 1: DATABASE FOUNDATION (4 Steps)

### Step 1.1: Add Lawyer Role to User System
**Files to modify:**
- Database: `auth.users` metadata
- Database: `user_profiles` table

**Actions:**
1. Update role enum to include 'lawyer'
2. Create migration: `20260306_add_lawyer_role.sql`
   - Add 'lawyer' to role enum type
   - Update RLS policies to include lawyer role
   - Add lawyer role to role validation constraints

**SQL Structure:**
```sql
-- Add lawyer to role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lawyer';

-- Update RLS policies to include lawyer
-- (Similar to mortgage_broker policies)
```

### Step 1.2: Create Lawyer Profiles Table
**Files to create:**
- `supabase/migrations/20260306_create_lawyer_profiles_table.sql`

**Table Schema:**
```sql
CREATE TABLE lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  law_firm_name TEXT,
  bar_association_number TEXT,
  practice_areas TEXT[], -- Array of specializations
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  consultation_fee DECIMAL(10,2),
  bio TEXT,
  languages_spoken TEXT[],
  office_address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  profile_image_url TEXT,
  is_accepting_clients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- Lawyers can view and edit their own profile
CREATE POLICY "Lawyers can view own profile"
  ON lawyer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can update own profile"
  ON lawyer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can insert own profile"
  ON lawyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view lawyer profiles (for directory)
CREATE POLICY "Public can view lawyer profiles"
  ON lawyer_profiles FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_lawyer_profiles_user_id ON lawyer_profiles(user_id);
CREATE INDEX idx_lawyer_profiles_practice_areas ON lawyer_profiles USING GIN(practice_areas);
CREATE INDEX idx_lawyer_profiles_city ON lawyer_profiles(city);
```

### Step 1.3: Create Lawyer-Client Relationship Table
**Files to create:**
- `supabase/migrations/20260306_create_lawyer_client_relationships.sql`

**Table Schema:**
```sql
CREATE TABLE lawyer_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES lawyer_profiles(user_id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT NOT NULL, -- 'landlord_tenant', 'real_estate', 'property_dispute', etc.
  case_description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
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

CREATE POLICY "Lawyers can view their client relationships"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can view their lawyer relationships"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can manage their client relationships"
  ON lawyer_client_relationships FOR ALL
  USING (auth.uid() = lawyer_id);

-- Indexes
CREATE INDEX idx_lawyer_client_lawyer_id ON lawyer_client_relationships(lawyer_id);
CREATE INDEX idx_lawyer_client_client_id ON lawyer_client_relationships(client_id);
CREATE INDEX idx_lawyer_client_status ON lawyer_client_relationships(status);
```

### Step 1.4: Create Legal Documents Storage
**Files to create:**
- `supabase/migrations/20260306_create_lawyer_documents_system.sql`

**Table Schema:**
```sql
CREATE TABLE lawyer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES lawyer_client_relationships(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'contract', 'agreement', 'letter', 'form', 'evidence'
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  is_confidential BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE lawyer_documents ENABLE ROW LEVEL SECURITY;

-- Storage bucket for lawyer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lawyer-documents', 'lawyer-documents', false);

-- Storage policies
CREATE POLICY "Lawyers can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lawyer-documents' AND
    auth.uid() IN (
      SELECT lawyer_id FROM lawyer_client_relationships
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Authorized users can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lawyer-documents' AND
    auth.uid() IN (
      SELECT lawyer_id FROM lawyer_client_relationships
      WHERE id::text = (storage.foldername(name))[1]
      UNION
      SELECT client_id FROM lawyer_client_relationships
      WHERE id::text = (storage.foldername(name))[1]
    )
  );
```

---

## PHASE 2: TYPESCRIPT TYPES & SERVICES (3 Steps)

### Step 2.1: Create TypeScript Types
**Files to create:**
- `src/types/lawyer.ts`

**Content:**
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
  languages_spoken: string[] | null;
  office_address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  profile_image_url: string | null;
  is_accepting_clients: boolean;
  created_at: string;
  updated_at: string;
}

export interface LawyerClientRelationship {
  id: string;
  lawyer_id: string;
  client_id: string;
  case_type: string;
  case_description: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  consultation_date: string | null;
  retainer_paid: boolean;
  retainer_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client_name?: string;
  client_email?: string;
}

export interface LawyerDocument {
  id: string;
  relationship_id: string;
  document_name: string;
  document_type: 'contract' | 'agreement' | 'letter' | 'form' | 'evidence';
  file_path: string;
  file_size: number | null;
  uploaded_by: string;
  is_confidential: boolean;
  notes: string | null;
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
  languages_spoken?: string[] | null;
  office_address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  is_accepting_clients?: boolean;
}

export const PRACTICE_AREAS = [
  'Landlord-Tenant Law',
  'Real Estate Law',
  'Property Disputes',
  'Lease Agreements',
  'Eviction Proceedings',
  'Housing Rights',
  'Commercial Real Estate',
  'Residential Real Estate',
  'Property Development',
  'Zoning & Land Use',
  'Construction Law',
  'Title Issues',
  'Mortgage Law',
  'Foreclosure Defense',
  'Property Tax Appeals'
] as const;

export const CASE_TYPES = [
  'landlord_tenant',
  'real_estate_transaction',
  'property_dispute',
  'lease_review',
  'eviction_defense',
  'eviction_filing',
  'housing_discrimination',
  'property_damage',
  'security_deposit',
  'rent_increase',
  'illegal_entry',
  'maintenance_issues',
  'other'
] as const;
```

### Step 2.2: Create Lawyer Service
**Files to create:**
- `src/services/lawyerService.ts`

**Content:**
```typescript
import { supabase } from "@/integrations/supabase/client";
import { LawyerProfile, LawyerFormData, LawyerClientRelationship } from "@/types/lawyer";

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
    console.error("Error fetching lawyer clients:", error);
    return [];
  }

  return data.map(relationship => ({
    ...relationship,
    client_name: relationship.client?.user_metadata?.full_name || "Unknown",
    client_email: relationship.client?.email || "No email"
  }));
}

export async function fetchAllLawyers(): Promise<LawyerProfile[]> {
  const { data, error } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("is_accepting_clients", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lawyers:", error);
    return [];
  }

  return data;
}

export async function createClientRelationship(
  lawyerId: string,
  clientId: string,
  caseType: string,
  caseDescription?: string
): Promise<LawyerClientRelationship | null> {
  const { data, error } = await supabase
    .from("lawyer_client_relationships")
    .insert({
      lawyer_id: lawyerId,
      client_id: clientId,
      case_type: caseType,
      case_description: caseDescription,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating client relationship:", error);
    throw error;
  }

  return data;
}
```

### Step 2.3: Create Document Service
**Files to create:**
- `src/services/lawyerDocumentService.ts`

**Content:**
```typescript
import { supabase } from "@/integrations/supabase/client";
import { LawyerDocument } from "@/types/lawyer";

export async function uploadLawyerDocument(
  relationshipId: string,
  file: File,
  documentType: string,
  notes?: string
): Promise<LawyerDocument | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${relationshipId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('lawyer-documents')
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading document:", uploadError);
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("lawyer_documents")
    .insert({
      relationship_id: relationshipId,
      document_name: file.name,
      document_type: documentType,
      file_path: fileName,
      file_size: file.size,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      notes: notes
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating document record:", error);
    throw error;
  }

  return data;
}

export async function fetchRelationshipDocuments(
  relationshipId: string
): Promise<LawyerDocument[]> {
  const { data, error } = await supabase
    .from("lawyer_documents")
    .select("*")
    .eq("relationship_id", relationshipId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data;
}
```

---

## PHASE 3: UI COMPONENTS (5 Steps)

### Step 3.1: Create Lawyer Dashboard Page
**Files to create:**
- `src/pages/dashboard/LawyerDashboard.tsx`

**Features:**
- Welcome banner with lawyer name
- Stats cards: Total Clients, Active Cases, Pending Consultations, This Month
- Quick action cards: Update Profile, View Clients, Manage Cases
- Recent clients list with case details
- Calendar integration for consultations

**Design Pattern:** Follow `MortgageBrokerDashboard.tsx` structure

### Step 3.2: Create Lawyer Profile Page
**Files to create:**
- `src/pages/dashboard/LawyerProfile.tsx`

**Features:**
- Personal information form
- Law firm details
- Bar association number
- Practice areas (multi-select)
- Years of experience
- Hourly rate & consultation fee
- Bio/description
- Languages spoken
- Office location
- Website & LinkedIn
- Profile image upload
- Accepting clients toggle

### Step 3.3: Create Lawyer Clients Page
**Files to create:**
- `src/pages/dashboard/LawyerClients.tsx`

**Features:**
- Client list with filters (status, case type)
- Search functionality
- Client cards showing:
  - Client name & contact
  - Case type & description
  - Status badge
  - Consultation date
  - Retainer status
  - Action buttons (View Details, Upload Document, Send Message)
- Add new client button
- Export client list

### Step 3.4: Create Lawyer Sidebar
**Files to create:**
- `src/components/dashboard/sidebar/LawyerSidebar.tsx`

**Menu Items:**
- 🏠 Dashboard
- 👤 Profile
- 👥 Clients
- 📄 Documents
- 📅 Calendar
- 💬 Messenger
- ⚙️ Settings

### Step 3.5: Create Lawyer Components
**Files to create:**
- `src/components/lawyer/ClientCard.tsx` - Display client information
- `src/components/lawyer/CaseDetailsModal.tsx` - View/edit case details
- `src/components/lawyer/DocumentUploadModal.tsx` - Upload legal documents
- `src/components/lawyer/ConsultationScheduler.tsx` - Schedule consultations
- `src/components/lawyer/PracticeAreasSelector.tsx` - Multi-select for practice areas

---

## PHASE 4: ROUTING & NAVIGATION (3 Steps)

### Step 4.1: Update Dashboard Routing
**Files to modify:**
- `src/pages/Dashboard.tsx`

**Changes:**
```typescript
// Add lawyer redirect
else if (effectiveRole === 'lawyer') {
  return <Navigate to="/dashboard/lawyer" replace />;
}
```

### Step 4.2: Add Lawyer Routes to App
**Files to modify:**
- `src/App.tsx`

**Add routes:**
```typescript
{/* Lawyer routes */}
<Route path="lawyer" element={<LawyerDashboard />} />
<Route path="lawyer/profile" element={<LawyerProfile />} />
<Route path="lawyer/clients" element={<LawyerClients />} />
<Route path="lawyer/documents" element={<LawyerDocuments />} />
<Route path="lawyer/calendar" element={<LawyerCalendar />} />
```

### Step 4.3: Update Sidebar to Show Lawyer Menu
**Files to modify:**
- `src/components/dashboard/DashboardSidebar.tsx`

**Add condition:**
```typescript
{role === 'lawyer' && (
  <LawyerSidebar isActive={isActive} showLabels={showLabels} />
)}
```

---

## PHASE 5: AUTHENTICATION & ROLE MANAGEMENT (2 Steps)

### Step 5.1: Update Signup Form
**Files to modify:**
- `src/components/auth/SignupForm.tsx`

**Changes:**
```typescript
// Add lawyer to role enum
role: z.enum(["seeker", "landlord", "renovator", "mortgage_broker", "lawyer"], {
  required_error: "Please select a role",
}),

// Add radio button
<FormItem className="flex items-center space-x-3 space-y-0">
  <FormControl>
    <RadioGroupItem value="lawyer" />
  </FormControl>
  <FormLabel className="font-normal cursor-pointer">
    Lawyer - Provide legal services & consultations
  </FormLabel>
</FormItem>
```

### Step 5.2: Update Route Guards
**Files to modify:**
- `src/components/dashboard/RouteGuard.tsx`

**Add lawyer role validation:**
```typescript
const lawyerRoutes = ['/dashboard/lawyer'];
if (lawyerRoutes.some(route => pathname.startsWith(route)) && role !== 'lawyer') {
  return <Navigate to="/dashboard" replace />;
}
```

---

## PHASE 6: INTEGRATION FEATURES (4 Steps)

### Step 6.1: Lawyer Directory for Users
**Files to create:**
- `src/pages/dashboard/FindLawyer.tsx`

**Features:**
- Browse all lawyers
- Filter by practice area, city, hourly rate
- View lawyer profiles
- Request consultation button
- Rating & reviews system

### Step 6.2: Consultation Booking System
**Files to create:**
- `src/components/lawyer/ConsultationBookingModal.tsx`

**Features:**
- Select lawyer
- Choose case type
- Describe issue
- Select preferred date/time
- Payment for consultation fee
- Confirmation email

### Step 6.3: Messaging Integration
**Files to modify:**
- `src/pages/dashboard/Chats.tsx`

**Add:**
- Lawyer-client messaging
- Document sharing in chat
- Consultation notes

### Step 6.4: Notification System
**Files to create:**
- `src/services/lawyerNotificationService.ts`

**Notifications for:**
- New client requests
- Upcoming consultations
- Document uploads
- Payment received
- Case status changes

---

## PHASE 7: TESTING & DEPLOYMENT (3 Steps)

### Step 7.1: Database Testing
**Files to create:**
- `test_lawyer_system.sql`

**Test:**
- Create lawyer profile
- Add client relationships
- Upload documents
- RLS policies work correctly

### Step 7.2: UI Testing
**Test scenarios:**
- Lawyer signup flow
- Profile creation/editing
- Client management
- Document upload/download
- Dashboard navigation
- Mobile responsiveness

### Step 7.3: Integration Testing
**Test:**
- Role-based routing
- Authentication flow
- Sidebar navigation
- Cross-role interactions (seeker finding lawyer)
- Messaging between lawyer and clients

---

## IMPLEMENTATION SUMMARY

### Total Steps: 24 Steps across 7 Phases

**Phase 1: Database** (4 steps) - Foundation
**Phase 2: Types & Services** (3 steps) - Business logic
**Phase 3: UI Components** (5 steps) - User interface
**Phase 4: Routing** (3 steps) - Navigation
**Phase 5: Auth** (2 steps) - Access control
**Phase 6: Integration** (4 steps) - Advanced features
**Phase 7: Testing** (3 steps) - Quality assurance

### Estimated Timeline
- Phase 1: 2-3 hours
- Phase 2: 2 hours
- Phase 3: 4-5 hours
- Phase 4: 1 hour
- Phase 5: 1 hour
- Phase 6: 3-4 hours
- Phase 7: 2-3 hours

**Total: 15-20 hours of development**

---

## KEY DESIGN DECISIONS

### 1. Practice Areas
Lawyers can select multiple practice areas from a predefined list, focusing on real estate and property law.

### 2. Client Relationships
Each lawyer-client relationship is tied to a specific case type, allowing lawyers to handle multiple cases for the same client.

### 3. Document Security
All legal documents are stored in a private bucket with strict RLS policies. Only the lawyer and client involved in a case can access documents.

### 4. Consultation Fees
Lawyers can set both hourly rates and one-time consultation fees, giving flexibility in pricing models.

### 5. Public Directory
Lawyer profiles are publicly viewable (except confidential info) to allow users to browse and select lawyers.

### 6. Status Tracking
Cases have clear status progression: pending → active → completed/cancelled

---

## FUTURE ENHANCEMENTS (Post-MVP)

1. **Payment Integration**: Stripe Connect for consultation fees and retainers
2. **Calendar Integration**: Google Calendar sync for consultations
3. **E-Signature**: DocuSign integration for legal documents
4. **Video Consultations**: Zoom/Teams integration
5. **Case Management**: Full case tracking with milestones and deadlines
6. **Billing System**: Time tracking and invoice generation
7. **Review System**: Client reviews and ratings for lawyers
8. **AI Legal Assistant**: Integration with existing legal AI features
9. **Document Templates**: Pre-built legal document templates
10. **Compliance Tracking**: Bar association compliance and license renewal reminders

---

## NOTES

- This plan follows the exact same pattern as the Mortgage Broker implementation
- All database tables use UUID for IDs and include proper timestamps
- RLS policies ensure data security and privacy
- The UI matches the existing dashboard design system
- Mobile-responsive design is built-in
- TypeScript types ensure type safety throughout

---

**Status**: ✅ Planning Complete - Ready for Implementation
**Next Step**: Begin Phase 1 - Database Foundation
