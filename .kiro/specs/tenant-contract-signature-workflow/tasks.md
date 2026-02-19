# Implementation Plan: Tenant Contract Signature Workflow

## Overview

This implementation plan adds tenant contract signature workflow functionality to the existing MyApplications page. The approach leverages existing components (LeaseContract page, ContractCard, leaseContractService) and adds minimal new code for contract button visibility and navigation. The implementation is organized into discrete steps that build incrementally, with testing integrated throughout.

## Tasks

- [ ] 1. Add contract existence checking logic to MyApplications page
  - Create helper function `hasSignableContract(applicationId)` that checks if a contract exists and is not in draft status
  - Add state management for tracking which applications have contracts
  - Load contract existence data when applications are fetched
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 1.1 Write property test for contract button visibility logic
  - **Property 1: Contract Button Visibility Rule**
  - **Validates: Requirements 1.1, 1.2, 1.3, 9.2**

- [ ] 2. Add Contract button to ProfessionalApplicationCard component
  - [ ] 2.1 Add Contract button rendering logic in ProfessionalApplicationCard
    - Add conditional rendering for Contract button based on application status and contract existence
    - Style button consistently with existing action buttons (purple theme)
    - Position button in the actions area alongside View and Withdraw buttons
    - Add FileText icon to button
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 2.2 Implement navigation handler for Contract button
    - Add onClick handler that navigates to `/dashboard/contracts/${application.id}`
    - Use React Router's navigate function
    - _Requirements: 2.1, 2.3_

  - [ ]* 2.3 Write property test for contract navigation
    - **Property 2: Contract Navigation Correctness**
    - **Validates: Requirements 2.1, 8.4**

- [ ] 3. Verify My Contracts tab functionality
  - [ ] 3.1 Verify ContractCard component displays all required information
    - Confirm property address, rent amount, lease dates, and landlord information are displayed
    - Verify status badges show correct text and styling for all contract statuses
    - Confirm action buttons (View, Review & Sign, PDF) appear based on contract status
    - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2_

  - [ ]* 3.2 Write property test for contract details display
    - **Property 5: Contract Details Display Completeness**
    - **Validates: Requirements 4.3**

  - [ ]* 3.3 Write property test for status badge display
    - **Property 7: Status Badge Display**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ] 3.2 Verify empty state handling in My Contracts tab
    - Confirm empty state message displays when no contracts exist
    - Verify empty state styling matches design
    - _Requirements: 4.4_

  - [ ]* 3.4 Write unit test for empty contracts list
    - Test that empty state message appears when contracts array is empty
    - **Validates: Requirements 4.4**

  - [ ] 3.3 Verify contract list ordering
    - Confirm contracts are ordered by creation date (most recent first)
    - _Requirements: 4.5_

  - [ ]* 3.5 Write property test for contract list ordering
    - **Property 6: Contract List Ordering**
    - **Validates: Requirements 4.5**

- [ ] 4. Verify LeaseContract page role detection and UI rendering
  - [ ] 4.1 Test role detection for tenant users
    - Verify system correctly identifies user as 'tenant' when user.id matches contract.tenant_id
    - Test with various contract scenarios
    - _Requirements: 3.1_

  - [ ]* 4.2 Write property test for role detection
    - **Property 3: Role Detection Accuracy**
    - **Validates: Requirements 3.1**

  - [ ] 4.3 Verify status-based UI rendering
    - Test that 'pending_tenant_signature' status shows signature interface
    - Test that 'pending_landlord_signature' status shows read-only view with waiting message
    - Test that 'fully_signed' status shows signed contract with download options
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 4.4 Write property test for status-based UI rendering
    - **Property 4: Status-Based UI Rendering**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 5. Implement error handling and user feedback
  - [ ] 5.1 Add error handling for contract not found scenario
    - Add check in LeaseContract page for null contract
    - Display error toast "Contract not found"
    - Redirect to /dashboard
    - _Requirements: 2.4, 10.1_

  - [ ]* 5.2 Write unit test for contract not found error
    - Test that error message displays and redirect occurs when contract is null
    - **Validates: Requirements 2.4**

  - [ ] 5.2 Add error handling for unauthorized access
    - Verify canUserAccessContract() is called before displaying contract
    - Display error toast "You do not have permission to view this contract"
    - Redirect to /dashboard
    - _Requirements: 7.1, 7.2, 10.1_

  - [ ]* 5.3 Write property test for access control verification
    - **Property 10: Access Control Verification**
    - **Property 11: Unauthorized Access Handling**
    - **Validates: Requirements 7.1, 7.2**

  - [ ] 5.3 Add error handling for signature failures
    - Wrap signContractAsTenant() call in try-catch
    - Display error toast with specific error message
    - Keep user on page to allow retry
    - _Requirements: 10.2_

  - [ ] 5.4 Add handling for double signature attempts
    - Check for existing tenant_signature before showing signature interface
    - Display info toast "You have already signed this contract" if already signed
    - _Requirements: 10.3_

  - [ ]* 5.5 Write unit test for double signature attempt
    - Test that info message displays when tenant tries to sign already-signed contract
    - **Validates: Requirements 10.3**

  - [ ] 5.5 Add error handling for PDF generation failures
    - Wrap printOntarioLease() call in try-catch
    - Display error toast "Failed to generate PDF. Please try again."
    - _Requirements: 10.1_

- [ ] 6. Add access control and security tests
  - [ ]* 6.1 Write property test for contract query filtering
    - **Property 12: Contract Query Filtering**
    - **Validates: Requirements 7.4**

  - [ ]* 6.2 Write property test for data leakage prevention
    - **Property 13: Data Leakage Prevention**
    - **Validates: Requirements 7.5**

- [ ] 7. Add download functionality tests
  - [ ]* 7.1 Write property test for download button visibility
    - **Property 8: Download Button Visibility**
    - **Validates: Requirements 6.1, 8.3**

  - [ ]* 7.2 Write property test for PDF content completeness
    - **Property 9: PDF Content Completeness**
    - **Validates: Requirements 6.3**

- [ ] 8. Add contract persistence tests
  - [ ]* 8.1 Write property test for contract persistence and retrieval
    - **Property 16: Contract Persistence and Retrieval**
    - **Validates: Requirements 9.4**

- [ ] 9. Add action button tests
  - [ ]* 9.1 Write property test for View button presence
    - **Property 14: View Button Presence**
    - **Validates: Requirements 8.1**

  - [ ]* 9.2 Write property test for Review & Sign button visibility
    - **Property 15: Review & Sign Button Visibility**
    - **Validates: Requirements 8.2**

- [ ] 10. Integration testing and final verification
  - [ ] 10.1 Test complete tenant contract workflow end-to-end
    - Create test scenario: approved application → contract created by landlord → tenant views and signs → download PDF
    - Verify all steps work correctly
    - Test with multiple contract statuses
    - _Requirements: All_

  - [ ] 10.2 Verify mobile responsiveness
    - Test Contract button on mobile layouts
    - Test My Contracts tab on mobile devices
    - Verify contract cards display correctly on small screens
    - _Requirements: 1.5, 8.5_

  - [ ] 10.3 Verify accessibility
    - Test keyboard navigation for all buttons
    - Verify screen reader compatibility for status badges and buttons
    - Check color contrast for status badges
    - _Requirements: 1.4, 5.6_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation leverages existing components and services, minimizing new code
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Integration testing ensures the complete workflow functions correctly
