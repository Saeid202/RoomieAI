# Property Archiving System - Requirements

## Introduction

This document specifies the requirements for implementing an automatic property archiving system. When a landlord approves an application and signs a lease contract, the property should be automatically archived (removed from active rental listings) and moved to an "Archived Properties" section where it can be renewed or re-listed later.

## Glossary

- **Active Property**: A property currently listed and available for rent
- **Archived Property**: A property that has been rented and is no longer available in rental listings
- **Archive**: The action of removing a property from active listings when a lease is signed
- **Re-list**: The action of making an archived property active again
- **Renew**: Creating a new lease for an existing tenant in an archived property
- **Rental Options**: The public-facing page where tenants browse available properties
- **My Properties**: The landlord's property management dashboard

## Business Rules

### Automatic Archiving Trigger
A property should be automatically archived when:
1. Landlord approves a rental application (status = 'approved')
2. Landlord creates a lease contract for that application
3. Landlord signs the lease contract (landlord_signature exists)

### Archive Behavior
When a property is archived:
1. Property status changes to 'archived' or 'rented'
2. Property is removed from "Rental Options" (tenant-facing listings)
3. Property remains visible in landlord's "My Properties" with "Archived" badge
4. Property details are preserved (not deleted)
5. Associated lease contract is linked to the property

### Re-listing Behavior
When a landlord re-lists an archived property:
1. Property status changes back to 'active' or 'available'
2. Property appears in "Rental Options" again
3. Previous lease information is preserved in history
4. Property can accept new applications

## Requirements

### Requirement 1: Automatic Property Archiving

**User Story:** As a landlord, when I sign a lease contract, the property should automatically be archived so it's no longer shown to other tenants.

#### Acceptance Criteria

1. WHEN a landlord signs a lease contract (adds landlord_signature), THEN THE system SHALL automatically update the associated property status to 'archived'
2. THE system SHALL record the archive date and reason (lease_signed)
3. THE system SHALL link the lease contract ID to the property record
4. THE system SHALL preserve all property details and history
5. IF the property archiving fails, THEN THE system SHALL log the error but not block the contract signing

### Requirement 2: Remove from Rental Options

**User Story:** As a tenant, I should not see properties that have been rented in the rental listings.

#### Acceptance Criteria

1. WHEN a property status is 'archived', THEN THE system SHALL exclude it from the rental options query
2. THE rental options page SHALL only show properties with status 'active' or 'available'
3. IF a tenant has an active application for an archived property, THEN THE system SHALL still allow them to view that specific property
4. THE system SHALL update the rental options list in real-time or within 1 minute of archiving

### Requirement 3: Archived Properties View

**User Story:** As a landlord, I want to see all my archived properties in a separate section so I can manage them.

#### Acceptance Criteria

1. THE landlord's "My Properties" page SHALL have an "Archived" tab or section
2. THE archived section SHALL display all properties with status 'archived'
3. FOR EACH archived property, THE system SHALL show:
   - Property details (address, rent, bedrooms, etc.)
   - Archive date
   - Current tenant information
   - Lease end date
   - "Re-list" button
   - "Renew Lease" button
4. THE system SHALL allow filtering and sorting of archived properties
5. THE system SHALL show the count of archived properties

### Requirement 4: Property Re-listing

**User Story:** As a landlord, I want to re-list an archived property when the lease ends so I can find new tenants.

#### Acceptance Criteria

1. WHEN a landlord clicks "Re-list" on an archived property, THEN THE system SHALL display a confirmation dialog
2. THE confirmation dialog SHALL show:
   - Property address
   - Current lease end date
   - Warning if lease is still active
   - Option to update property details before re-listing
3. WHEN the landlord confirms re-listing, THEN THE system SHALL:
   - Update property status to 'active'
   - Clear the current tenant association (if lease ended)
   - Make the property visible in rental options
   - Log the re-listing action
4. IF the lease is still active, THEN THE system SHALL warn the landlord and require confirmation
5. THE system SHALL allow the landlord to edit property details during re-listing

### Requirement 5: Lease Renewal

**User Story:** As a landlord, I want to renew a lease for an existing tenant without re-listing the property.

#### Acceptance Criteria

1. WHEN a landlord clicks "Renew Lease" on an archived property, THEN THE system SHALL:
   - Pre-fill a new lease form with existing tenant and property information
   - Allow the landlord to update lease terms (rent, duration, etc.)
   - Keep the property in archived status
2. WHEN the new lease is signed by both parties, THEN THE system SHALL:
   - Mark the old lease as 'expired' or 'superseded'
   - Activate the new lease
   - Update the property's lease end date
3. THE system SHALL maintain a history of all leases for the property

### Requirement 6: Property Status Management

**User Story:** As a system administrator, I want clear property status definitions so the system behaves consistently.

#### Acceptance Criteria

1. THE system SHALL support the following property statuses:
   - 'active': Available for rent, shown in listings
   - 'archived': Rented, not shown in listings
   - 'draft': Not yet published
   - 'inactive': Temporarily unavailable (maintenance, etc.)
2. THE system SHALL enforce status transition rules:
   - active → archived (when lease signed)
   - archived → active (when re-listed)
   - active → inactive (manual landlord action)
   - inactive → active (manual landlord action)
3. THE system SHALL prevent invalid status transitions
4. THE system SHALL log all status changes with timestamp and reason

### Requirement 7: Database Schema Updates

**User Story:** As a developer, I need the database schema to support property archiving.

#### Acceptance Criteria

1. THE properties table SHALL have the following fields:
   - status: enum('active', 'archived', 'draft', 'inactive')
   - archived_at: timestamp (nullable)
   - archive_reason: text (nullable)
   - current_lease_id: uuid (nullable, foreign key to lease_contracts)
   - current_tenant_id: uuid (nullable, foreign key to users)
2. THE lease_contracts table SHALL have:
   - property_id: uuid (foreign key to properties)
   - status: enum including 'active', 'expired', 'superseded'
3. THE system SHALL create indexes on:
   - properties.status
   - properties.landlord_id + properties.status
   - lease_contracts.property_id + lease_contracts.status

### Requirement 8: Notification System

**User Story:** As a landlord, I want to be notified when my property is archived or when a lease is about to expire.

#### Acceptance Criteria

1. WHEN a property is archived, THEN THE system SHALL send a notification to the landlord:
   - "Your property at [address] has been archived. The lease with [tenant] is now active."
2. WHEN a lease is 30 days from expiration, THEN THE system SHALL send a notification:
   - "The lease for [address] expires on [date]. Would you like to renew or re-list?"
3. WHEN a lease expires, THEN THE system SHALL send a notification:
   - "The lease for [address] has expired. You can now re-list the property."
4. THE system SHALL allow landlords to configure notification preferences

### Requirement 9: Analytics and Reporting

**User Story:** As a landlord, I want to see statistics about my archived properties.

#### Acceptance Criteria

1. THE landlord dashboard SHALL display:
   - Total active properties
   - Total archived properties
   - Properties with leases expiring in 30 days
   - Average time properties stay archived
2. THE system SHALL provide a property history view showing:
   - All leases for a property
   - Vacancy periods
   - Rental income history
3. THE system SHALL allow exporting property and lease data

### Requirement 10: Tenant Application Handling

**User Story:** As a system, I need to handle existing applications when a property is archived.

#### Acceptance Criteria

1. WHEN a property is archived, THEN THE system SHALL:
   - Automatically reject all pending applications with status 'pending' or 'under_review'
   - Send notification to applicants: "The property at [address] is no longer available."
   - Keep the approved application that led to the lease
2. THE system SHALL not allow new applications for archived properties
3. IF a tenant tries to apply for an archived property, THEN THE system SHALL show: "This property is no longer available for rent."

## Non-Functional Requirements

### Performance
- Property archiving should complete within 2 seconds
- Rental options query should exclude archived properties efficiently (< 100ms)
- Re-listing should complete within 2 seconds

### Security
- Only the property owner can archive or re-list a property
- Only the property owner can view archived property details
- Tenant information in archived properties is protected

### Data Integrity
- Property archiving is transactional (all or nothing)
- Lease contract and property status must remain consistent
- No data loss during archiving or re-listing

### Usability
- Clear visual distinction between active and archived properties
- One-click re-listing with confirmation
- Easy access to archived properties section

## Success Metrics

1. **Automation Rate**: 100% of signed leases automatically archive properties
2. **User Satisfaction**: Landlords can easily find and manage archived properties
3. **Data Accuracy**: Property status always reflects actual rental state
4. **Performance**: Archiving completes in < 2 seconds
5. **Adoption**: Landlords use re-listing feature when leases expire

## Future Enhancements

1. **Bulk Operations**: Archive or re-list multiple properties at once
2. **Scheduled Re-listing**: Automatically re-list on lease end date
3. **Property Templates**: Save property details for easy re-listing
4. **Tenant Portal**: Allow tenants to request lease renewal
5. **Integration**: Connect with property management software
