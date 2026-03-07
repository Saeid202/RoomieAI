# Lawyer Role Implementation - Quick Reference

## 📋 OVERVIEW

Adding a complete Lawyer role to the platform with dashboard, profile management, client tracking, and document management.

---

## 🎯 WHAT WE'RE BUILDING

### Core Features
1. **Lawyer Dashboard** - Overview of clients, cases, and consultations
2. **Lawyer Profile** - Professional information, practice areas, rates
3. **Client Management** - Track cases, status, and relationships
4. **Document System** - Secure upload/download of legal documents
5. **Consultation Booking** - Schedule and manage client meetings
6. **Lawyer Directory** - Public listing for users to find lawyers

---

## 📊 IMPLEMENTATION BREAKDOWN

### 7 Phases, 24 Steps, ~15-20 Hours

```
Phase 1: Database (4 steps)          ⏱️ 2-3 hours
├─ Add lawyer role to system
├─ Create lawyer_profiles table
├─ Create lawyer_client_relationships table
└─ Create lawyer_documents storage

Phase 2: Types & Services (3 steps)  ⏱️ 2 hours
├─ Create TypeScript types
├─ Create lawyer service
└─ Create document service

Phase 3: UI Components (5 steps)     ⏱️ 4-5 hours
├─ Lawyer Dashboard page
├─ Lawyer Profile page
├─ Lawyer Clients page
├─ Lawyer Sidebar
└─ Supporting components

Phase 4: Routing (3 steps)           ⏱️ 1 hour
├─ Update Dashboard routing
├─ Add lawyer routes to App
└─ Update sidebar navigation

Phase 5: Auth (2 steps)              ⏱️ 1 hour
├─ Update signup form
└─ Update route guards

Phase 6: Integration (4 steps)       ⏱️ 3-4 hours
├─ Lawyer directory for users
├─ Consultation booking
├─ Messaging integration
└─ Notification system

Phase 7: Testing (3 steps)           ⏱️ 2-3 hours
├─ Database testing
├─ UI testing
└─ Integration testing
```

---

## 🗂️ DATABASE TABLES

### 1. lawyer_profiles
```
- id, user_id, full_name, email, phone_number
- law_firm_name, bar_association_number
- practice_areas[], years_of_experience
- hourly_rate, consultation_fee, bio
- languages_spoken[], office_address
- city, province, postal_code
- website_url, linkedin_url, profile_image_url
- is_accepting_clients
```

### 2. lawyer_client_relationships
```
- id, lawyer_id, client_id
- case_type, case_description, status
- consultation_date, retainer_paid, retainer_amount
- notes
```

### 3. lawyer_documents
```
- id, relationship_id, document_name
- document_type, file_path, file_size
- uploaded_by, is_confidential, notes
```

---

## 🎨 UI PAGES

### 1. Lawyer Dashboard (`/dashboard/lawyer`)
- Welcome banner with stats
- Quick action cards
- Recent clients list
- Upcoming consultations

### 2. Lawyer Profile (`/dashboard/lawyer/profile`)
- Personal & professional info form
- Practice areas selector
- Rates & fees
- Office location
- Bio/description

### 3. Lawyer Clients (`/dashboard/lawyer/clients`)
- Client list with filters
- Search functionality
- Client cards with case details
- Action buttons (view, upload, message)

### 4. Find Lawyer (`/dashboard/find-lawyer`)
- Public directory of lawyers
- Filter by practice area, city, rate
- Request consultation button

---

## 🔐 SECURITY

### RLS Policies
- Lawyers can view/edit their own profile
- Lawyers can view their client relationships
- Clients can view their lawyer relationships
- Documents accessible only to lawyer + client
- Public can view lawyer profiles (for directory)

### Storage
- Private bucket: `lawyer-documents`
- Folder structure: `{relationship_id}/{filename}`
- Signed URLs for secure access

---

## 🎯 PRACTICE AREAS

```
- Landlord-Tenant Law
- Real Estate Law
- Property Disputes
- Lease Agreements
- Eviction Proceedings
- Housing Rights
- Commercial Real Estate
- Residential Real Estate
- Property Development
- Zoning & Land Use
- Construction Law
- Title Issues
- Mortgage Law
- Foreclosure Defense
- Property Tax Appeals
```

---

## 📱 CASE TYPES

```
- landlord_tenant
- real_estate_transaction
- property_dispute
- lease_review
- eviction_defense
- eviction_filing
- housing_discrimination
- property_damage
- security_deposit
- rent_increase
- illegal_entry
- maintenance_issues
- other
```

---

## 🔄 CASE STATUS FLOW

```
Pending → Active → Completed
                 ↘ Cancelled
```

---

## 🛣️ ROUTING STRUCTURE

```
/dashboard/lawyer                    → Lawyer Dashboard
/dashboard/lawyer/profile            → Lawyer Profile
/dashboard/lawyer/clients            → Client Management
/dashboard/lawyer/documents          → Document Library
/dashboard/lawyer/calendar           → Consultation Calendar
/dashboard/find-lawyer               → Public Lawyer Directory
```

---

## 📦 FILES TO CREATE

### Database Migrations (4 files)
```
supabase/migrations/
├─ 20260306_add_lawyer_role.sql
├─ 20260306_create_lawyer_profiles_table.sql
├─ 20260306_create_lawyer_client_relationships.sql
└─ 20260306_create_lawyer_documents_system.sql
```

### TypeScript Types (1 file)
```
src/types/
└─ lawyer.ts
```

### Services (2 files)
```
src/services/
├─ lawyerService.ts
└─ lawyerDocumentService.ts
```

### Pages (4 files)
```
src/pages/dashboard/
├─ LawyerDashboard.tsx
├─ LawyerProfile.tsx
├─ LawyerClients.tsx
└─ FindLawyer.tsx
```

### Components (6 files)
```
src/components/dashboard/sidebar/
└─ LawyerSidebar.tsx

src/components/lawyer/
├─ ClientCard.tsx
├─ CaseDetailsModal.tsx
├─ DocumentUploadModal.tsx
├─ ConsultationScheduler.tsx
└─ PracticeAreasSelector.tsx
```

### Files to Modify (4 files)
```
src/
├─ App.tsx                           (add routes)
├─ pages/Dashboard.tsx               (add redirect)
├─ components/auth/SignupForm.tsx    (add lawyer option)
└─ components/dashboard/
   ├─ DashboardSidebar.tsx           (add lawyer sidebar)
   └─ RouteGuard.tsx                 (add lawyer validation)
```

---

## ✅ CHECKLIST

### Phase 1: Database
- [ ] Add lawyer role to enum
- [ ] Create lawyer_profiles table
- [ ] Create lawyer_client_relationships table
- [ ] Create lawyer_documents storage
- [ ] Set up RLS policies
- [ ] Test database access

### Phase 2: Types & Services
- [ ] Create lawyer.ts types
- [ ] Create lawyerService.ts
- [ ] Create lawyerDocumentService.ts
- [ ] Test service functions

### Phase 3: UI Components
- [ ] Build LawyerDashboard page
- [ ] Build LawyerProfile page
- [ ] Build LawyerClients page
- [ ] Build LawyerSidebar
- [ ] Build supporting components

### Phase 4: Routing
- [ ] Update Dashboard.tsx redirect
- [ ] Add routes to App.tsx
- [ ] Update DashboardSidebar.tsx
- [ ] Test navigation

### Phase 5: Auth
- [ ] Add lawyer to SignupForm
- [ ] Update RouteGuard
- [ ] Test signup flow
- [ ] Test role-based access

### Phase 6: Integration
- [ ] Build FindLawyer directory
- [ ] Add consultation booking
- [ ] Integrate messaging
- [ ] Add notifications

### Phase 7: Testing
- [ ] Database tests
- [ ] UI tests
- [ ] Integration tests
- [ ] Mobile responsiveness
- [ ] Security audit

---

## 🚀 DEPLOYMENT STEPS

1. Run database migrations in order
2. Restart Supabase (if local)
3. Clear browser cache
4. Test signup with lawyer role
5. Test lawyer dashboard access
6. Test client management
7. Test document upload/download
8. Verify RLS policies work
9. Test on mobile devices
10. Deploy to production

---

## 📚 REFERENCE IMPLEMENTATIONS

### Similar Existing Roles
- **Mortgage Broker**: `src/pages/dashboard/MortgageBrokerDashboard.tsx`
- **Landlord**: `src/pages/dashboard/landlord/LandlordDashboard.tsx`
- **Renovator**: `src/pages/renovator/RenovatorDashboard.tsx`

### Design Patterns
- Dashboard layout: Follow MortgageBrokerDashboard
- Sidebar: Follow MortgageBrokerSidebar
- Profile form: Follow MortgageBrokerProfile
- Client list: Follow MortgageBrokerClients

---

## 🎨 DESIGN TOKENS

### Colors
```css
--lawyer-primary: #8B5CF6 (purple)
--lawyer-secondary: #EC4899 (pink)
--lawyer-accent: #6366F1 (indigo)
--status-active: #10B981 (green)
--status-pending: #F59E0B (yellow)
--status-completed: #3B82F6 (blue)
--status-cancelled: #EF4444 (red)
```

### Gradients
```css
background: from-pink-500/20 via-purple-500/20 to-indigo-500/20
button: from-purple-600 to-pink-600
card: from-white via-purple-50/30 to-pink-50/30
```

---

## 💡 KEY DECISIONS

1. **Multi-case support**: One lawyer can handle multiple cases for same client
2. **Public profiles**: Lawyers visible in directory for user discovery
3. **Flexible pricing**: Both hourly rates and consultation fees
4. **Secure documents**: Private storage with strict access control
5. **Practice areas**: Focus on real estate and property law
6. **Status tracking**: Clear progression from pending to completed

---

## 🔮 FUTURE ENHANCEMENTS

- Payment integration (Stripe Connect)
- Calendar sync (Google Calendar)
- E-signature (DocuSign)
- Video consultations (Zoom)
- Time tracking & billing
- Client reviews & ratings
- AI legal assistant integration
- Document templates library

---

**Status**: ✅ Planning Complete
**Next**: Begin Phase 1 - Database Foundation
**Estimated Time**: 15-20 hours total
