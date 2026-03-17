# Contract Signature Workflow - Tasks

- [x] 1. Create database migration to rename status value
- [x] 2. Update notification service with new tenant_signed type
- [x] 3. Update ontarioLeaseService.ts status naming and notifications
- [x] 4. Update contractService.ts status naming and notifications
- [x] 5. Update leaseContractService.ts status in interfaces
- [x] 6. Update ontarioLease.ts type definition
- [x] 7. Update ContractReview.tsx status badge display

## Task Details

### 1. Create database migration to rename status value

Create a new migration file to update the CHECK constraint in the lease_contracts table.

**File**: `supabase/migrations/{date}_rename_contract_status.sql`

```sql
-- Rename pending_tenant_signature to pending
ALTER TABLE public.lease_contracts DROP CONSTRAINT IF EXISTS lease_contracts_status_check;
ALTER TABLE public.lease_contracts ADD CONSTRAINT lease_contracts_status_check
CHECK (status IN ('draft', 'pending_landlord_signature', 'pending', 'fully_signed', 'executed', 'active', 'cancelled'));
```

### 2. Update notification service with new tenant_signed type

**File**: `src/services/notificationService.ts`

- Add `tenant_signed` to the notification type union
- Update `createContractNotification` function to handle `tenant_signed` type

### 3. Update ontarioLeaseService.ts status naming and notifications

**File**: `src/services/ontarioLeaseService.ts`

- Change `pending_tenant_signature` to `pending` in `signOntarioLeaseAsLandlord()`
- Add landlord notification in `signOntarioLeaseAsTenant()` with type `tenant_signed`
- Keep existing tenant notification with type `contract_signed`

### 4. Update contractService.ts status naming and notifications

**File**: `src/services/contractService.ts`

- Update status type definition
- Add landlord notification when tenant signs

### 5. Update leaseContractService.ts status in interfaces

**File**: `src/services/leaseContractService.ts`

- Update `LeaseContract` interface status type

### 6. Update ontarioLease.ts type definition

**File**: `src/types/ontarioLease.ts`

- Update `ContractStatus` type to use `pending` instead of `pending_tenant_signature`

### 7. Update ContractReview.tsx status badge display

**File**: `src/pages/dashboard/landlord/ContractReview.tsx`

- Change `pending_tenant_signature` case to `pending` in `getStatusBadge()` function