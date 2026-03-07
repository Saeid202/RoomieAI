# Re-finance Application Implementation Plan

## Overview
Add a new "Re-finance Application" tab to the Mortgage Profile page with a completely independent document management system for refinancing applications.

## Tab Order
**Current:** Profile → Documents → Broker Feedback  
**New:** Profile → Documents → **Re-finance Application** → Broker Feedback

---

## Document Categories & Fields

### 1. Identity
- Government-Issued Photo ID

### 2. Income Verification
- Employment Letter
- Recent Pay Stubs
- T4 Slips (Last 2 Years)
- Notice of Assessment – CRA (Last 2 Years)

### 3. Self-Employed (if applicable)
- Personal Tax Returns (Last 2 Years)
- Business Financial Statements
- Business License or Incorporation Documents

### 4. Property Documents
- Current Mortgage Statement
- Property Tax Bill
- Property Insurance Policy
- Purchase Agreement (if available)

### 5. Financial / Assets
- Bank Statements (Last 3 Months)

### 6. Debt Statements
- Credit Card Statements
- Car Loan Statement
- Personal Loan Statement
- Line of Credit Statement
- Student Loan Statement

---

## Implementation Phases

### **PHASE 1: Database & Backend Setup** ✅ COMPLETE
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Create new database table: `refinance_documents`**
   - Columns:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `mortgage_profile_id` (uuid, foreign key to mortgage_profiles)
     - `document_category` (text: 'identity', 'income', 'self_employed', 'property', 'assets', 'debt')
     - `document_type` (text: specific document type)
     - `file_name` (text)
     - `file_path` (text)
     - `file_size` (bigint)
     - `mime_type` (text)
     - `upload_status` (text: 'pending', 'uploaded', 'verified', 'rejected')
     - `uploaded_at` (timestamp)
     - `verified_at` (timestamp, nullable)
     - `verified_by` (uuid, nullable)
     - `notes` (text, nullable)
     - `is_required` (boolean)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

2. **Create storage bucket: `refinance-documents`**
   - Private bucket
   - Max file size: 10MB
   - Allowed file types: PDF, JPG, PNG, HEIC

3. **Set up RLS (Row Level Security) policies**
   - Users can only access their own documents
   - Mortgage brokers can view documents from profiles with consent
   - Insert policy: authenticated users can upload
   - Select policy: users see own documents OR brokers with consent
   - Update policy: users can update own documents
   - Delete policy: users can delete own documents

4. **Create storage policies**
   - Upload: authenticated users to their own folder
   - Download: users access own files OR brokers with consent
   - Delete: users can delete own files

#### Deliverables:
- Migration file: `supabase/migrations/YYYYMMDD_refinance_documents_system.sql`
- Storage bucket configuration
- RLS policies
- Storage policies

---

### **PHASE 2: TypeScript Types & Constants** ✅ COMPLETE
**Estimated Time:** 1 hour

#### Tasks:
1. **Create type definitions: `src/types/refinanceDocument.ts`**
   ```typescript
   export type RefinanceDocumentCategory =
     | 'identity'
     | 'income'
     | 'self_employed'
     | 'property'
     | 'assets'
     | 'debt';

   export type RefinanceDocumentStatus =
     | 'pending'
     | 'uploaded'
     | 'verified'
     | 'rejected';

   export interface RefinanceDocument {
     id: string;
     user_id: string;
     mortgage_profile_id: string;
     document_category: RefinanceDocumentCategory;
     document_type: string;
     file_name: string;
     file_path: string;
     file_size: number;
     mime_type: string;
     upload_status: RefinanceDocumentStatus;
     uploaded_at: string;
     verified_at?: string;
     verified_by?: string;
     notes?: string;
     is_required: boolean;
     created_at: string;
     updated_at: string;
   }

   export interface DocumentTypeConfig {
     type: string;
     label: string;
     required: boolean;
     acceptedFormats: string[];
     maxSize: number;
     description?: string;
   }

   export interface DocumentCategoryConfig {
     category: RefinanceDocumentCategory;
     label: string;
     icon: string;
     documentTypes: DocumentTypeConfig[];
   }
   ```

2. **Define document categories and types**
   - Map all 18 document types to their categories
   - Set required/optional flags
   - Define accepted formats and size limits

#### Deliverables:
- `src/types/refinanceDocument.ts`
- Complete type definitions
- Document configuration constants

---

### **PHASE 3: Service Layer** ✅ COMPLETE
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Create service: `src/services/refinanceDocumentService.ts`**
   - `uploadDocument()` - Upload file to storage and create DB record
   - `getDocumentsByProfile()` - Fetch all documents for a profile
   - `getDocumentsByCategory()` - Fetch documents by category
   - `deleteDocument()` - Delete from storage and DB
   - `getDocumentUrl()` - Get signed URL for viewing
   - `updateDocumentStatus()` - Update verification status
   - `getDocumentCompletionStats()` - Calculate completion percentage
   - `validateFile()` - Validate file before upload

2. **Error handling**
   - File size validation
   - File type validation
   - Upload error handling
   - Storage cleanup on DB failure

#### Deliverables:
- `src/services/refinanceDocumentService.ts`
- Complete CRUD operations
- Error handling
- File validation

---

### **PHASE 4: UI Components - Document Upload** ✅ COMPLETE
**Estimated Time:** 3-4 hours

#### Tasks:
1. **Create component: `src/components/refinance/RefinanceDocumentUploadSlot.tsx`**
   - Similar to existing `DocumentUploadSlot` but for refinance
   - Upload button
   - File preview
   - Delete button
   - Upload progress indicator
   - Status badges (uploaded, verified, rejected)

2. **Create component: `src/components/refinance/RefinanceDocumentCategorySection.tsx`**
   - Category header with icon
   - List of document types in category
   - Upload slots for each document type
   - Completion indicator per category

#### Deliverables:
- `src/components/refinance/RefinanceDocumentUploadSlot.tsx`
- `src/components/refinance/RefinanceDocumentCategorySection.tsx`
- Reusable upload components

---

### **PHASE 5: Main Tab Component** ✅ COMPLETE
**Estimated Time:** 3-4 hours

#### Tasks:
1. **Create component: `src/components/refinance/RefinanceApplicationTab.tsx`**
   - Header with title and description
   - Overall completion progress bar
   - Document categories sections (6 sections)
   - Category-by-category layout
   - Completion statistics
   - Help/instructions section

2. **Styling**
   - Match existing mortgage documents tab design
   - Purple/indigo color scheme
   - Responsive layout
   - Loading states
   - Empty states

#### Deliverables:
- `src/components/refinance/RefinanceApplicationTab.tsx`
- Complete tab UI
- Progress tracking
- Category sections

---

### **PHASE 6: Integration with Mortgage Profile Page** ✅ COMPLETE
**Estimated Time:** 1-2 hours

#### Tasks:
1. **Update: `src/pages/dashboard/BuyingOpportunities.tsx`**
   - Add new tab to tab navigation
   - Update tab order: Profile → Documents → **Re-finance Application** → Broker Feedback
   - Import and render `RefinanceApplicationTab`
   - Pass `mortgageProfileId` prop
   - Handle tab state management

2. **Tab navigation styling**
   - Ensure consistent styling with other tabs
   - Active state highlighting
   - Responsive design

#### Deliverables:
- Updated `BuyingOpportunities.tsx`
- New tab integrated
- Proper tab ordering

---

### **PHASE 7: Broker Access (Optional Enhancement)**
**Estimated Time:** 2 hours

#### Tasks:
1. **Update broker clients view**
   - Add refinance documents section to broker view
   - Show completion status
   - Allow brokers to view uploaded documents
   - Add verification workflow

2. **Broker feedback integration**
   - Allow brokers to leave feedback on refinance docs
   - Status updates (verified/rejected)
   - Notes on documents

#### Deliverables:
- Broker view enhancements
- Document verification workflow

---

### **PHASE 8: Testing & Polish**
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Functional testing**
   - Upload documents in all categories
   - Delete documents
   - View documents
   - Check completion stats
   - Test file validation
   - Test error handling

2. **UI/UX polish**
   - Loading states
   - Error messages
   - Success notifications
   - Empty states
   - Responsive design

3. **Security testing**
   - RLS policies working correctly
   - Storage policies enforced
   - Users can't access others' documents

#### Deliverables:
- Tested feature
- Bug fixes
- Polished UI

---

## Total Estimated Time
**18-22 hours** (approximately 2-3 days of development)

---

## Phase Breakdown Summary

| Phase | Description | Time | Dependencies |
|-------|-------------|------|--------------|
| 1 | Database & Backend | 2-3h | None |
| 2 | TypeScript Types | 1h | Phase 1 |
| 3 | Service Layer | 2-3h | Phase 1, 2 |
| 4 | Upload Components | 3-4h | Phase 2, 3 |
| 5 | Main Tab Component | 3-4h | Phase 4 |
| 6 | Page Integration | 1-2h | Phase 5 |
| 7 | Broker Access (Optional) | 2h | Phase 6 |
| 8 | Testing & Polish | 2-3h | All phases |

---

## Key Design Decisions

### 1. **Separate Table**
- `refinance_documents` is completely independent from `mortgage_documents`
- No shared data or foreign keys between them
- Allows independent evolution of both systems

### 2. **Reuse Patterns**
- Follow same patterns as existing mortgage documents
- Similar component structure
- Consistent UI/UX
- Same security model (RLS + storage policies)

### 3. **Category Organization**
- 6 main categories for better organization
- 18 total document types
- Clear labeling and descriptions
- Required vs optional flags

### 4. **User Experience**
- Progress tracking per category and overall
- Visual feedback on upload status
- Easy document management (view, delete, re-upload)
- Help text and instructions

### 5. **Security**
- Private storage bucket
- RLS policies for data access
- Storage policies for file access
- User isolation (can only see own documents)
- Broker consent model (same as mortgage documents)

---

## Files to Create

### Backend
1. `supabase/migrations/YYYYMMDD_refinance_documents_system.sql`

### Types
2. `src/types/refinanceDocument.ts`

### Services
3. `src/services/refinanceDocumentService.ts`

### Components
4. `src/components/refinance/RefinanceDocumentUploadSlot.tsx`
5. `src/components/refinance/RefinanceDocumentCategorySection.tsx`
6. `src/components/refinance/RefinanceApplicationTab.tsx`

### Updates
7. `src/pages/dashboard/BuyingOpportunities.tsx` (update existing)

---

## Success Criteria

✅ New "Re-finance Application" tab appears in correct position  
✅ All 18 document types are available for upload  
✅ Documents organized into 6 categories  
✅ Upload, view, and delete functionality works  
✅ Progress tracking shows completion percentage  
✅ RLS policies prevent unauthorized access  
✅ Storage policies enforce file access rules  
✅ UI matches existing mortgage documents design  
✅ Responsive design works on all screen sizes  
✅ Error handling provides clear feedback  
✅ Broker consent model works (if Phase 7 implemented)

---

## Next Steps

1. **Review this plan** - Confirm approach and phases
2. **Start Phase 1** - Create database migration
3. **Sequential execution** - Complete phases in order
4. **Testing after each phase** - Ensure quality
5. **Final integration testing** - End-to-end validation

---

## Notes

- This is a **completely independent system** from mortgage documents
- No data sharing between refinance and mortgage document tables
- Same security model and patterns for consistency
- Can be extended later with additional features (broker workflow, status tracking, etc.)
- Follows existing codebase patterns and conventions
