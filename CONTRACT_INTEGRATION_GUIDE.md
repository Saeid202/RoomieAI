# Contract Integration Guide

## Overview
This document explains how the two-party digital contract signing system integrates with the existing RoomieAI rental application workflow.

## Integration Flow

### 1. Application Approval Triggers Contract Creation
When a landlord approves a rental application through the Applications dashboard:

1. **Location**: `src/pages/dashboard/landlord/Applications.tsx`
2. **Function**: `handleUpdateStatus()` 
3. **Trigger**: Status change to 'approved'
4. **Action**: Automatically creates a rental contract using `createContractFromApplication()`

### 2. Contract Creation Process
**File**: `src/utils/contractUtils.ts`

The `createContractFromApplication()` function:
- Takes approved application data and property details
- Generates comprehensive contract terms including:
  - Property information (address, bedrooms, bathrooms)
  - Tenant details (name, income, occupation)
  - Rental terms (monthly rent, security deposit, lease duration)
  - Special conditions (pets, smoking, utilities)
  - Emergency contact information
- Creates contract record in database with `draft` status
- Returns contract ID for reference

### 3. Notification System
**File**: `src/components/notifications/ContractNotifications.tsx`

Integrated into the main navigation (`src/components/Navbar.tsx`):
- Bell icon with unread count badge
- Shows different notification types:
  - **Contract Ready**: New contract awaiting signature
  - **Contract Signed**: User signed, waiting for other party
  - **Contract Completed**: Both parties have signed
- Notifications link directly to contract pages

### 4. Contract Management Pages
The following pages handle the contract workflow:

- **Contracts List**: `/dashboard/contracts` - Shows all user contracts
- **Contract Details**: `/dashboard/contracts/:contractId` - View/manage specific contract
- **Contract Signing**: Embedded in contract details for digital signature

### 5. Database Integration
**Migration File**: `create_rental_contracts_table.sql`

Key fields:
- Contract status tracking (draft → pending signatures → executed)
- Digital signature storage (tenant_signature_data, landlord_signature_data)
- Timestamps for signature events
- Property and user relationships
- Contract terms and conditions

## User Experience Flow

### For Tenants:
1. Submit rental application through `/dashboard/rental-application/:propertyId`
2. Wait for landlord approval
3. Receive notification when contract is ready for signing
4. Navigate to contract page via notification
5. Review contract terms and provide digital signature
6. Wait for landlord to sign
7. Receive confirmation when contract is fully executed

### For Landlords:
1. Review applications in `/dashboard/landlord/applications`
2. Approve suitable application
3. System automatically creates contract
4. Receive notification that contract needs signature
5. Review and sign contract
6. Contract becomes active when both parties have signed

## Technical Implementation Details

### Services
- **contractService**: CRUD operations for contracts
- **contractUtils**: Helper functions for contract creation and status management

### Components
- **ContractSigning**: Digital signature capture with validation
- **ContractStatus**: Visual status display and progress tracking
- **ContractDetails**: Full contract management interface
- **ContractNotifications**: Real-time notification system

### Types
- **RentalContract**: Main contract interface
- **ContractData**: Contract creation payload
- **SignatureData**: Digital signature information
- **ContractStatus**: Status enum for workflow states

## Security Features
- Row Level Security (RLS) policies ensure users only access their contracts
- Digital signatures include timestamp, IP address, and browser fingerprint
- Contract expiration dates prevent indefinite pending states
- Input validation and sanitization throughout

## Next Steps
1. Execute database migration to create `rental_contracts` table
2. Test end-to-end workflow from application to contract signing
3. Implement PDF generation for signed contracts
4. Add email notifications for contract events
5. Consider integration with DocuSign or other e-signature providers for legal compliance

## File Structure
```
src/
├── utils/contractUtils.ts              # Integration helper functions
├── services/contractService.ts         # Contract CRUD operations
├── types/contract.ts                   # Contract type definitions
├── components/
│   ├── notifications/ContractNotifications.tsx
│   ├── rental/ContractSigning.tsx
│   ├── rental/ContractStatus.tsx
│   └── rental/ContractDetails.tsx
├── pages/dashboard/
│   ├── Contracts.tsx                   # Contract list page
│   ├── ContractDetails.tsx             # Individual contract page
│   └── landlord/Applications.tsx       # Updated with contract creation
└── migrations/
    └── 20241015_create_rental_contracts_table.sql
```

## Configuration
Ensure the following environment variables are set:
- Supabase project URL and anon key
- Proper RLS policies are enabled
- Storage buckets configured for document uploads (if needed)

This integration provides a seamless transition from rental application approval to contract execution, maintaining consistency with the existing RoomieAI user experience while adding powerful contract management capabilities.