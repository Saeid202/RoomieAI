# Contract Signature Workflow - Requirements

## Overview
Update the contract signature workflow to:
1. Simplify status naming (`pending_tenant_signature` → `pending`)
2. Add proper notification system for both landlord and tenant

## Background
The current contract signature workflow has:
- Status: `pending_tenant_signature` (unnecessarily verbose)
- Missing landlord notification when tenant signs
- Inconsistent notification types

## Requirements

### 1. Status Renaming
- **Current**: `pending_tenant_signature`
- **New**: `pending`
- **Rationale**: Simpler naming that clearly indicates "waiting for tenant signature"

### 2. Notification Types
| Type | Trigger | Recipient | Message |
|------|---------|-----------|---------|
| `contract_ready` | Landlord signs | Tenant | "Landlord has signed the contract. Please review and sign." |
| `tenant_signed` | Tenant signs | Landlord | "Tenant has signed the contract." |
| `contract_signed` | Both signed | Tenant | "Contract is fully executed by both parties." |

### 3. Workflow Flow
```
draft → pending_landlord_signature → pending → fully_signed
                                    ↑
                          (landlord signed,
                           waiting for tenant)
```

### 4. Notification Flow
1. Landlord signs → Tenant receives `contract_ready` notification
2. Tenant signs → Landlord receives `tenant_signed` notification
3. Both signed → Tenant receives `contract_signed` notification

## Files to Modify

### Database
- `supabase/migrations/20240104_create_lease_contracts.sql` - Update CHECK constraint

### Services
- `src/services/notificationService.ts` - Add `tenant_signed` type
- `src/services/ontarioLeaseService.ts` - Update status naming, add landlord notification
- `src/services/contractService.ts` - Update status naming, add landlord notification
- `src/services/leaseContractService.ts` - Update status in interfaces

### UI
- `src/pages/dashboard/landlord/ContractReview.tsx` - Update status badge display

### Types
- `src/types/ontarioLease.ts` - Update status type definition

## Out of Scope
- Signature verification (checkbox only for now)
- Auto-expiration logic
- PDF generation for non-Ontario contracts