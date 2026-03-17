# Lender Role - Requirements

## Overview
Add a new "Lender" role to the main app, similar to lawyer and mortgage broker roles. Lenders are financial institutions that provide mortgage loans to buyers/seekers.

## User Roles

| Role | Dashboard | Profile Table |
|------|-----------|---------------|
| Lender | `/dashboard/lender` | `lender_profiles` |

## Background

The app currently has:
- **Mortgage Broker**: Helps seekers find mortgage options
- **Lender**: The actual financial institution providing the loan

Mortgage brokers act as intermediaries between seekers and lenders.

## Functional Requirements

### 1. Lender Registration & Profile
- Lender can sign up with company information
- Company name, logo, contact details
- License number (optional verification)
- Set company profile as public/private

### 2. Rate Management
- Set interest rates for different loan types:
  - Fixed-rate mortgages (15-year, 30-year, etc.)
  - Variable-rate mortgages
  - FHA, VA, conventional loans
- Update rates anytime
- Rate history tracking

### 3. Mortgage Profile Access
- With seeker consent, view mortgage profiles
- See seeker financial information (income, credit score range, etc.)
- See property details they're pre-approved for
- Provide rate quotes to seekers

### 4. Dashboard Features
- Overview of mortgage requests
- Pending approvals
- Rate quote history
- Communication with seekers

### 5. Integration with Existing System
- Link to existing `mortgage_profiles` table
- Link to existing `user_profiles` for role management
- RLS policies for data access

## Non-Functional Requirements
- Secure access to sensitive financial data
- Rate changes should be logged
- Consent-based access to mortgage profiles
- Responsive dashboard UI

## Out of Scope
- Payment processing (handled separately)
- Loan servicing after approval
- Legal document signing (lawyer handles this)

## Dependencies
- Existing `mortgage_profiles` table
- Existing `user_profiles` table with role enum
- Existing notification system
- Existing chat/messaging system