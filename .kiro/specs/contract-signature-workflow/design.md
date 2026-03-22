# Contract Signature Workflow - Design

## 1. Database Changes

### 1.1 Migration: Update Status CHECK Constraint

**File**: `supabase/migrations/20240104_create_lease_contracts.sql`

```sql
-- Change from:
status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_landlord_signature', 'pending_tenant_signature', 'fully_signed', 'executed', 'active', 'cancelled'))

-- To:
status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_landlord_signature', 'pending', 'fully_signed', 'executed', 'active', 'cancelled'))
```

## 2. Service Layer Changes

### 2.1 Notification Service

**File**: `src/services/notificationService.ts`

Add new notification type:

```typescript
export interface CreateNotificationInput {
  user_id: string;
  type: 'contract_ready' | 'contract_signed' | 'tenant_signed' | 'application_approved' | 'application_rejected' | 'general';
  title: string;
  message: string;
  link?: string;
}

export async function createContractNotification(
  landlordId: string,
  tenantId: string,
  contractId: string,
  type: 'contract_ready' | 'contract_signed' | 'tenant_signed'
): Promise<void> {
  switch (type) {
    case 'contract_ready':
      await createNotification({
        user_id: tenantId,
        type: 'contract_ready',
        title: 'Contract Ready for Your Signature',
        message: 'The landlord has signed the lease contract. Please review and sign.',
        link: `/dashboard/contracts/${contractId}`
      });
      break;

    case 'tenant_signed':
      await createNotification({
        user_id: landlordId,
        type: 'tenant_signed',
        title: 'Tenant Has Signed the Contract',
        message: 'The tenant has signed the lease contract. The contract is now fully executed.',
        link: `/dashboard/landlord/contracts/${contractId}`
      });
      break;

    case 'contract_signed':
      await createNotification({
        user_id: tenantId,
        type: 'contract_signed',
        title: 'Contract Fully Executed',
        message: 'Your lease contract has been fully executed by both parties.',
        link: `/dashboard/contracts/${contractId}`
      });
      break;
  }
}
```

### 2.2 Ontario Lease Service

**File**: `src/services/ontarioLeaseService.ts`

Update `signOntarioLeaseAsLandlord()`:

```typescript
const newStatus = contract.tenant_signature ? 'fully_signed' : 'pending';
```

Update `signOntarioLeaseAsTenant()`:

```typescript
// Notify landlord that tenant signed
await createContractNotification(
  data.landlord_id,
  data.tenant_id,
  data.id,
  'tenant_signed'
);

// Also notify tenant that contract is fully executed
await createContractNotification(
  data.landlord_id,
  data.tenant_id,
  data.id,
  'contract_signed'
);
```

### 2.3 Contract Service

**File**: `src/services/contractService.ts`

Update `signContract()` to add landlord notification when tenant signs.

## 3. Type Definitions

**File**: `src/types/ontarioLease.ts`

```typescript
export type ContractStatus =
  | 'draft'
  | 'pending_landlord_signature'
  | 'pending'
  | 'fully_signed'
  | 'executed'
  | 'active'
  | 'cancelled';
```

## 4. UI Changes

**File**: `src/pages/dashboard/landlord/ContractReview.tsx`

```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending_landlord_signature':
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Awaiting Your Signature</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Waiting for Tenant</Badge>;
    case 'fully_signed':
      return <Badge variant="default" className="text-green-600 bg-green-50">Fully Executed</Badge>;
    default:
      return <Badge variant="secondary">{status.replace(/_/g, ' ')}</Badge>;
  }
};
```

## 5. Notification Summary

| Event | Notification Type | Recipient | Title |
|-------|------------------|-----------|-------|
| Landlord signs | `contract_ready` | Tenant | Contract Ready for Your Signature |
| Tenant signs | `tenant_signed` | Landlord | Tenant Has Signed the Contract |
| Both signed | `contract_signed` | Tenant | Contract Fully Executed |

## 6. Status Flow

```
draft → pending_landlord_signature → pending → fully_signed
```