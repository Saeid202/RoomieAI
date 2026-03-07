# Broker Access to Re-finance Application - Implementation Plan

## Overview
Enable mortgage brokers to view client refinance documents when the client has given consent via the existing `broker_consent` field in `mortgage_profiles` table.

---

## Current State Analysis

### ✅ Already Working
1. **Database RLS Policies** - The refinance_documents table already has broker access policies:
   - Brokers can SELECT documents where `mortgage_profiles.broker_consent = true`
   - Brokers can UPDATE document status (verification) with consent
   - Storage policies allow brokers to view files with consent

2. **Consent Mechanism** - The `broker_consent` field exists in `mortgage_profiles`:
   - Users toggle consent in their Profile tab
   - Same consent controls BOTH mortgage documents AND refinance documents
   - No separate consent needed (unified consent model)

3. **Service Layer** - `refinanceDocumentService.ts` already has:
   - `getDocumentsByProfile()` - will respect RLS policies
   - `getDocumentUrl()` - will respect storage policies
   - `updateDocumentStatus()` - for broker verification

### ❌ Missing Components
1. **Broker UI** - No way for brokers to view refinance documents in their dashboard
2. **Tab Integration** - MortgageBrokerClients page needs refinance tab
3. **Completion Stats** - Brokers need to see refinance document completion
4. **Document Viewer** - Brokers need to view/verify refinance documents

---

## Implementation Plan

### **PHASE 1: Add Refinance Tab to Broker Clients Page** ✅ COMPLETE
**Estimated Time:** 2 hours

#### Tasks:
1. **Update: `src/pages/dashboard/MortgageBrokerClients.tsx`**
   - Add third tab: "Re-finance Documents"
   - Update TabsList from `grid-cols-2` to `grid-cols-3`
   - Tab order: Profile Report → Documents → **Re-finance Documents**

2. **Create RefinanceDocumentsTab component (inline or separate)**
   - Similar structure to existing DocumentsTab
   - Fetch refinance documents using `getDocumentsByProfile()` from refinanceDocumentService
   - Group by category (6 categories)
   - Show document count per category
   - View button for each document
   - Verification status badges

3. **Load refinance documents in useEffect**
   - Fetch refinance documents for each client
   - Store in state: `clientRefinanceDocuments`
   - Show count badge on tab if documents exist

#### Code Changes:
```typescript
// Add to imports
import { getDocumentsByProfile as getRefinanceDocuments } from '@/services/refinanceDocumentService';
import { REFINANCE_DOCUMENT_CATEGORIES } from '@/types/refinanceDocument';
import type { RefinanceDocument } from '@/types/refinanceDocument';

// Add state
const [clientRefinanceDocuments, setClientRefinanceDocuments] = useState<Record<string, RefinanceDocument[]>>({});

// Update loadClients to fetch refinance docs
const refinanceDocsMap: Record<string, RefinanceDocument[]> = {};
for (const client of data) {
    const { data: refinanceDocs } = await getRefinanceDocuments(client.id);
    if (refinanceDocs) {
        refinanceDocsMap[client.id] = refinanceDocs;
    }
}
setClientRefinanceDocuments(refinanceDocsMap);

// Add tab to TabsList
<TabsTrigger value="refinance">
    <div className="flex items-center gap-2">
        Re-finance Documents
        {refinanceDocs.length > 0 && (
            <Badge className="bg-purple-100 text-purple-700 text-xs">
                {refinanceDocs.length}
            </Badge>
        )}
    </div>
</TabsTrigger>

// Add TabsContent
<TabsContent value="refinance" className="mt-6">
    <RefinanceDocumentsTab />
</TabsContent>
```

#### Deliverables:
- Updated `MortgageBrokerClients.tsx` with refinance tab
- Refinance documents visible to brokers with consent
- Document count badges
- View functionality

---

### **PHASE 2: Add Refinance Document Count to Client Table** ✅ COMPLETE
**Estimated Time:** 30 minutes

#### Tasks:
1. **Update client table row in MortgageBrokerClients.tsx**
   - Add refinance document count column OR
   - Combine with existing "Documents" column to show both counts
   - Example: "12 mortgage / 8 refinance"

2. **Visual indicator**
   - Show refinance document completion percentage
   - Badge if refinance application is complete

#### Code Changes:
```typescript
// In table body
<td className="px-6 py-4 whitespace-nowrap">
    <div className="space-y-1">
        <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{docs.length}</span>
            <span className="text-xs text-gray-500">mortgage</span>
        </div>
        <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-900">{refinanceDocs.length}</span>
            <span className="text-xs text-gray-500">refinance</span>
        </div>
    </div>
</td>
```

#### Deliverables:
- Document counts visible in table
- Clear distinction between mortgage and refinance docs

---

### **PHASE 3: Add Broker Verification Workflow (Optional)**
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Create component: `src/components/refinance/BrokerRefinanceDocumentViewer.tsx`**
   - View document button
   - Verification status dropdown (pending → verified/rejected)
   - Notes field for broker feedback
   - Save verification button

2. **Update refinanceDocumentService.ts**
   - Already has `updateDocumentStatus()` function
   - No changes needed

3. **Add verification UI to broker's refinance tab**
   - Show verification status for each document
   - Allow brokers to mark as verified/rejected
   - Add notes per document

#### Deliverables:
- Broker can verify/reject refinance documents
- Broker can add notes to documents
- Verification status tracked

---

### **PHASE 4: Add Refinance Section to PDF Export (Optional)**
**Estimated Time:** 1 hour

#### Tasks:
1. **Update PDF generation in MortgageBrokerClients.tsx**
   - Add refinance documents section to PDF
   - Show document list with verification status
   - Include completion statistics

2. **Styling**
   - Match existing PDF format
   - Clear section headers
   - Document checklist format

#### Deliverables:
- PDF includes refinance documents section
- Complete client report with both mortgage and refinance docs

---

## Security Verification

### ✅ Already Secured (No Changes Needed)
1. **RLS Policies on refinance_documents table:**
   - ✅ Brokers can only SELECT with `broker_consent = true`
   - ✅ Brokers can only UPDATE status with consent
   - ✅ Users cannot see other users' documents

2. **Storage Policies on refinance-documents bucket:**
   - ✅ Brokers can only view files with consent
   - ✅ File path validation prevents unauthorized access

3. **Consent Model:**
   - ✅ Single `broker_consent` field controls ALL broker access
   - ✅ Turning off consent revokes access to both mortgage AND refinance docs
   - ✅ No separate consent needed

### 🔍 Testing Required
- Verify broker can see refinance docs when consent = true
- Verify broker CANNOT see refinance docs when consent = false
- Verify broker can view files through signed URLs
- Verify broker can update verification status

---

## Key Design Decisions

### 1. **Unified Consent Model** ✅
- Use existing `broker_consent` field from `mortgage_profiles`
- One consent toggle controls access to BOTH:
  - Mortgage documents (existing)
  - Refinance documents (new)
- Simpler for users (one decision, not two)
- Consistent security model

### 2. **Reuse Existing Patterns** ✅
- Follow same UI structure as mortgage documents tab
- Same verification workflow
- Same document viewing mechanism
- Consistent user experience

### 3. **No Database Changes Required** ✅
- RLS policies already reference `broker_consent`
- Storage policies already configured correctly
- No migration needed for broker access

### 4. **Tab Organization**
- Broker sees 3 tabs per client:
  1. Profile Report (existing)
  2. Documents (mortgage documents - existing)
  3. **Re-finance Documents** (new)

---

## Implementation Phases Summary

| Phase | Description | Time | Database Changes | UI Changes |
|-------|-------------|------|------------------|------------|
| 1 | Add Refinance Tab | 2h | None | MortgageBrokerClients.tsx |
| 2 | Document Count Display | 30m | None | Table row update |
| 3 | Verification Workflow | 2-3h | None | New component |
| 4 | PDF Export | 1h | None | PDF generation |

**Total Time:** 5.5-6.5 hours

---

## Files to Modify

### Frontend Only (No Backend Changes)
1. `src/pages/dashboard/MortgageBrokerClients.tsx` - Add refinance tab and document loading
2. `src/components/refinance/BrokerRefinanceDocumentViewer.tsx` - (Optional) Verification UI

### No Changes Needed
- ✅ Database schema (already complete)
- ✅ RLS policies (already configured)
- ✅ Storage policies (already configured)
- ✅ Service layer (already has all functions)
- ✅ Consent mechanism (already working)

---

## Testing Checklist

### User Side
- [ ] User can toggle broker consent on/off
- [ ] User can upload refinance documents
- [ ] User sees their own refinance documents

### Broker Side (with consent = true)
- [ ] Broker sees refinance tab for client
- [ ] Broker can view all refinance documents
- [ ] Broker can open documents in new tab
- [ ] Broker sees document count in table
- [ ] Broker can verify/reject documents (Phase 3)
- [ ] PDF includes refinance section (Phase 4)

### Broker Side (with consent = false)
- [ ] Broker does NOT see client in list
- [ ] Broker CANNOT access refinance documents
- [ ] Broker CANNOT view refinance files

---

## Success Criteria

✅ Brokers can view refinance documents when consent is given  
✅ Brokers CANNOT view refinance documents without consent  
✅ Refinance tab appears in broker's client view  
✅ Document counts show in client table  
✅ Brokers can open and view refinance documents  
✅ Security policies prevent unauthorized access  
✅ UI matches existing mortgage documents design  
✅ No separate consent needed (unified model)  

---

## Key Advantages of This Approach

1. **No Database Changes** - RLS policies already configured correctly
2. **Unified Consent** - One toggle controls all broker access
3. **Consistent UX** - Same patterns as mortgage documents
4. **Secure by Default** - Existing security model extends automatically
5. **Fast Implementation** - Only frontend changes needed
6. **Easy Testing** - Use existing consent toggle to test

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Start Phase 1** - Add refinance tab to broker clients page
3. **Test with consent** - Verify broker can see documents
4. **Test without consent** - Verify broker cannot see documents
5. **Optional phases** - Add verification workflow and PDF export

---

## Notes

- The RLS policies in the migration file ALREADY check `broker_consent`
- No additional database work needed
- This is purely a UI enhancement
- Security is already handled at the database level
- Brokers will automatically get access when consent is given
- Revoking consent automatically removes access to refinance docs

