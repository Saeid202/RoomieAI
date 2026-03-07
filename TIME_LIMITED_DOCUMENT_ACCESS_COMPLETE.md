# Time-Limited Document Access - Implementation Complete

## Overview
Added time-limited access control for property document access requests. Landlords can now grant temporary access with automatic expiration, providing better security for sensitive documents.

## Key Features

### 1. Flexible Access Duration Options
When approving a document access request, landlords can choose:
- 1 Hour
- 6 Hours  
- 24 Hours (1 Day)
- 72 Hours (3 Days)
- 1 Week
- 2 Weeks
- 30 Days
- Permanent Access (no expiration)

### 2. Automatic Expiration
- Access automatically expires after the selected duration
- RLS policies enforce expiration at the database level
- Status changes from 'approved' to 'expired' automatically
- Buyers see clear expiration warnings

### 3. Visual Indicators

**For Landlords:**
- Expiration countdown shown on approved requests
- Color-coded warnings (orange for <24h remaining)
- Clear expiration date/time display

**For Buyers:**
- Expiration countdown when viewing documents
- Urgent warning when <24 hours remaining
- "Access Expired" status with option to request again

## Implementation Details

### Database Changes
**File:** `supabase/migrations/20260305_add_time_limited_document_access.sql`

1. Added `access_expires_at` column to `document_access_requests`
2. Added `response_message` column (if missing)
3. Updated RLS policy to check expiration: `access_expires_at IS NULL OR access_expires_at > NOW()`
4. Created `expire_document_access()` function for batch expiration
5. Added index for efficient expiration queries

### Service Layer Updates
**File:** `src/services/propertyDocumentService.ts`

1. Updated `respondToAccessRequest()` signature:
   ```typescript
   export async function respondToAccessRequest(
     requestId: string,
     status: 'approved' | 'denied',
     responseMessage?: string,
     expiresAt?: string  // NEW: Optional expiration timestamp
   ): Promise<void>
   ```

2. Added `checkDocumentAccess()` helper:
   ```typescript
   export async function checkDocumentAccess(
     propertyId: string
   ): Promise<{ hasAccess: boolean; expiresAt?: string | null }>
   ```

3. Updated `downloadDocument()` to check expiration before allowing download

### UI Components

**File:** `src/components/landlord/DocumentAccessRequestCard.tsx`

Added:
- Access duration selector dropdown
- Expiration countdown display for approved requests
- Color-coded expiration warnings
- Default selection: 24 hours

**File:** `src/components/property/PropertyDocumentViewerSimplified.tsx`

Added:
- Expiration warning banner for buyers
- "Access Expired" status handling
- Countdown timer showing hours remaining
- Urgent warning styling when <24h remaining

### Type Updates
**File:** `src/types/propertyCategories.ts`

Updated `DocumentAccessRequest` interface:
```typescript
export interface DocumentAccessRequest {
  // ... existing fields
  status: 'pending' | 'approved' | 'denied' | 'expired'; // Added 'expired'
  access_expires_at?: string | null; // NEW
}
```

## Security Benefits

1. **Time-Boxed Access**: Limits exposure window for sensitive documents
2. **Automatic Enforcement**: RLS policies prevent access after expiration
3. **No Manual Revocation Needed**: Access expires automatically
4. **Audit Trail**: Expiration timestamps logged in database
5. **Flexible Control**: Landlords choose appropriate duration per request

## User Experience Flow

### Landlord Approving Request:
1. Sees pending document access request
2. Selects access duration from dropdown (default: 24 hours)
3. Clicks "Approve" button
4. System calculates expiration timestamp
5. Buyer receives access with countdown timer

### Buyer with Time-Limited Access:
1. Sees "Access Granted" badge
2. Warning banner shows expiration countdown
3. Can view/download documents until expiration
4. After expiration: "Access Expired" message with option to request again

### Automatic Expiration:
1. RLS policies check expiration on every document access
2. Expired access is automatically blocked
3. Status updates to 'expired' when detected
4. Buyer must request access again

## Testing Checklist

- [ ] Run migration: `supabase migration up`
- [ ] Landlord: Approve request with 1-hour duration
- [ ] Buyer: Verify expiration countdown appears
- [ ] Buyer: Try to access documents before expiration (should work)
- [ ] Wait for expiration or manually update timestamp
- [ ] Buyer: Try to access documents after expiration (should fail)
- [ ] Verify "Access Expired" status shows correctly
- [ ] Test "Request Again" button works
- [ ] Test permanent access option (no expiration)

## Database Schema

```sql
-- document_access_requests table
CREATE TABLE document_access_requests (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  requester_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  access_expires_at TIMESTAMPTZ,  -- NEW: NULL = permanent access
  response_message TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Status
✅ Database migration created
✅ Service layer updated
✅ Landlord UI updated with duration selector
✅ Buyer UI updated with expiration warnings
✅ RLS policies enforce expiration
✅ Auto-expiration function created
✅ Ready for testing

## Next Steps
1. Run the migration
2. Test with real document access requests
3. Verify expiration enforcement works correctly
4. Consider adding email notifications before expiration (optional enhancement)
