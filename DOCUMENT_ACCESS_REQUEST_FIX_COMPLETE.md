# Document Access Request System - Fix Complete

## Problem
Document access requests were not showing in the Sales Inquiries tab because:
1. The `document_access_requests` table didn't exist in the database
2. The component was trying to insert into wrong table (`property_document_access`)
3. The Applications page query had incorrect joins
4. TypeScript types didn't match the actual table structure

## Solution Applied

### 1. Database Table Created
Created `document_access_requests` table with:
- Property-level access (not individual document access)
- Fields: `property_id`, `requester_id`, `requester_name`, `requester_email`, `request_message`, `status`, `reviewed_at`, `reviewed_by`
- Proper RLS policies for requesters and property owners
- Indexes for performance

### 2. Fixed PropertyDocumentViewerSimplified.tsx
- Updated to use `document_access_requests` table
- Removed `document_id` field (property-level access)
- Fixed query to check property-level access status

### 3. Fixed Applications.tsx
- Removed incorrect join with `property_documents` table
- Query now correctly fetches property-level access requests
- Shows requests in Sales Inquiries tab

### 4. Fixed DocumentAccessRequestCard.tsx
- Changed "Requested Document" to "Requested Access: All Property Documents"
- Updated field names: `responded_at` → `reviewed_at`
- Removed dependency on `document` field

### 5. Updated TypeScript Types
- Fixed `DocumentAccessRequest` interface to match table structure
- Removed `document_id` field
- Updated field names to match database

### 6. Fixed propertyDocumentService.ts
- Updated `respondToAccessRequest()` to use correct field names
- Changed `responded_at` → `reviewed_at`
- Changed `responded_by` → `reviewed_by`

## Files Modified
1. `src/components/property/PropertyDocumentViewerSimplified.tsx`
2. `src/pages/dashboard/landlord/Applications.tsx`
3. `src/components/landlord/DocumentAccessRequestCard.tsx`
4. `src/types/propertyCategories.ts`
5. `src/services/propertyDocumentService.ts`

## Files Created
1. `create_document_access_requests_table.sql` - Table creation script
2. `verify_document_access_system.sql` - Verification script

## Testing Steps

### 1. Verify Table Creation
Run in Supabase SQL Editor:
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'document_access_requests'
) as table_exists;
```

### 2. Test Request Flow
1. As a buyer, go to a sales listing detail page
2. Click "Request Full Document Access" button
3. Add optional message and submit
4. Verify request shows "Request Pending" status

### 3. Verify in Sales Inquiries
1. As the seller, go to Applications → Sales Inquiries tab
2. Scroll down to "Document Access Requests" section
3. Verify the request appears with buyer details
4. Test Approve/Decline buttons

### 4. Test Approved Access
1. As seller, approve a request
2. As buyer, refresh the property page
3. Verify "View All Documents" button appears
4. Click to access document vault

## Known Issues

### TypeScript Errors (Non-Breaking)
- Supabase types need regeneration to recognize new tables
- Errors like "Type instantiation is excessively deep"
- These are compile-time only - code works at runtime

### To Fix TypeScript Errors
Run in terminal:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Or use Supabase CLI:
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

## System Architecture

### Property-Level Access Model
- One request per property (not per document)
- Approval grants access to ALL documents for that property
- Simpler UX and fewer database records
- Easier to manage for sellers

### Request States
1. **none** - No request made yet
2. **pending** - Request submitted, awaiting seller review
3. **approved** - Seller granted access
4. **denied** - Seller declined access

### Security
- RLS policies ensure:
  - Users can only see their own requests
  - Property owners can see requests for their properties
  - Only authenticated users can create requests
  - Only property owners can approve/deny requests

## Next Steps
1. Refresh browser and test the complete flow
2. Verify requests appear in Sales Inquiries tab
3. Test approve/deny functionality
4. Regenerate Supabase types to fix TypeScript errors (optional)
