# Document Upload Fix - Type Mismatch Resolution

## Issue
Property Tax Bill and Disclosures documents were failing to upload.

## Root Cause
**Type mismatch between TypeScript and database:**

### Database Constraint (setup_property_documents_storage.sql)
```sql
CONSTRAINT valid_document_type CHECK (
    document_type IN (
        'title_deed',
        'property_tax_bill',      -- ✓ Full name
        'disclosures',            -- ✓ Plural
        'status_certificate',
        'condo_bylaws',
        'reserve_fund_study',
        'building_inspection',    -- ✓ Full name
        'appraisal_report',
        'survey_plan',            -- ✓ Different name
        ...
    )
)
```

### TypeScript Types (BEFORE FIX)
```typescript
export type PropertyDocumentType =
  | 'title_deed'
  | 'tax_bill'              // ✗ Shortened
  | 'disclosure'            // ✗ Singular
  | 'land_survey'           // ✗ Different name
  | 'inspection_report'     // ✗ Different name
  | 'other';
```

## Solution Applied

### 1. Updated PropertyDocumentType
Changed `src/types/propertyCategories.ts` to match database exactly:
```typescript
export type PropertyDocumentType =
  | 'title_deed'
  | 'property_tax_bill'     // ✓ Fixed
  | 'disclosures'           // ✓ Fixed
  | 'status_certificate'
  | 'condo_bylaws'
  | 'reserve_fund_study'
  | 'building_inspection'   // ✓ Fixed
  | 'appraisal_report'
  | 'survey_plan'           // ✓ Fixed
  | 'zoning_documents'
  | 'rental_income_statement'
  | 'tenant_lease_agreements'
  | 'maintenance_records'
  | 'utility_bills'
  | 'insurance_policy'
  | 'hoa_documents'
  | 'environmental_reports'
  | 'permits_licenses'
  | 'floor_plans'
  | 'other';
```

### 2. Updated DOCUMENT_SLOTS Configuration
Fixed the document slot definitions:
```typescript
{
  type: 'property_tax_bill',  // Was: 'tax_bill'
  label: 'Property Tax Bill',
  ...
},
{
  type: 'disclosures',        // Was: 'disclosure'
  label: 'Disclosures',
  ...
},
{
  type: 'survey_plan',        // Was: 'land_survey'
  label: 'Land Survey',
  ...
},
{
  type: 'building_inspection', // Was: 'inspection_report'
  label: 'Home Inspection Report',
  ...
}
```

## Files Modified
- `src/types/propertyCategories.ts` - Fixed type definitions and document slots

## Testing
After this fix, you should be able to:
1. Upload Property Tax Bill documents
2. Upload Disclosures documents
3. Upload all other document types without constraint violations

## Why This Happened
The TypeScript types were created with shortened/simplified names for developer convenience, but the database constraint was set up with the full official document names. This caused a mismatch where the frontend would try to insert documents with types like `tax_bill` but the database only accepts `property_tax_bill`.

## Prevention
Added comment to PropertyDocumentType:
```typescript
/**
 * Document types for property listings
 * IMPORTANT: These must match the database constraint in property_documents table
 */
```
