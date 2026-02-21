# Payment Methods Investigation Report

## Executive Summary

Your application uses **Stripe** as the primary and only payment processor. The system implements a comprehensive payment infrastructure with multiple Stripe products integrated.

---

## Payment Methods Currently Used

### 1. **Stripe Payments API** (Primary Payment Processing)
- **Purpose**: Process rent payments from tenants
- **Payment Types Supported**:
  - Credit Cards
  - Debit Cards  
  - Bank Accounts (ACH via Stripe Financial Connections)
- **Implementation**: `src/pages/dashboard/landlord/DigitalWallet.tsx`

### 2. **Stripe Financial Connections** (Bank Account Verification)
- **Purpose**: Securely connect and verify Canadian bank accounts
- **Features**:
  - Real-time bank balance verification
  - NSF (Non-Sufficient Funds) prevention
  - Support for major Canadian banks (RBC, TD, Scotiabank, BMO, CIBC, etc.)
  - ACSS Debit payment method creation
- **Implementation**: 
  - Edge Function: `supabase/functions/manage-financial-connections/index.ts`
  - Frontend: `src/pages/dashboard/landlord/DigitalWallet.tsx` (bank selection modal)
  - Diagnostic Scripts: `browser-verification.js`, `alternative-bank-connection.js`

### 3. **Stripe Connect** (Landlord Payouts)
- **Purpose**: Enable landlords to receive rent payments directly to their bank accounts
- **Type**: Stripe Express Accounts
- **Features**:
  - Embedded onboarding flow
  - Automatic payouts (2-3 business days)
  - Account management dashboard
  - KYC/compliance handling
- **Implementation**:
  - Edge Function: `supabase/functions/stripe-connect/index.ts`
  - Frontend: `ConnectAccountOnboarding` and `ConnectAccountManagement` components
  - Database: `payment_accounts` table with `stripe_account_id` and `stripe_account_status`

---

## Database Architecture

### Core Payment Tables

1. **`payment_accounts`**
   - Stores landlord and tenant wallet information
   - Tracks Stripe Connect account IDs for landlords
   - Fields: `stripe_account_id`, `stripe_account_status`, `available_balance`, `pending_balance`

2. **`payment_methods`**
   - Stores saved payment methods (cards and bank accounts)
   - Links to Stripe Payment Method IDs
   - Fields: `stripe_payment_method_id`, `card_type`, `brand`, `last4`, `is_default`

3. **`user_stripe_customers`**
   - Maps users to Stripe Customer IDs
   - One-to-one relationship with users
   - Used for Financial Connections sessions

4. **`rent_payments`** / **`rental_payments`**
   - Transaction history
   - Payment status tracking
   - Links tenants, landlords, and properties

5. **`rent_ledgers`**
   - Upcoming rent obligations
   - Due dates and amounts
   - Auto-pay configuration

---

## Payment Flow Architecture

### For Tenants (Paying Rent):

```
1. Tenant adds payment method
   ↓
2. Stripe creates Payment Method ID
   ↓
3. Saved to payment_methods table
   ↓
4. Tenant initiates payment from rent ledger
   ↓
5. Edge function creates Payment Intent
   ↓
6. Stripe processes payment
   ↓
7. Funds held in platform account
   ↓
8. Automatic transfer to landlord's Stripe Connect account
   ↓
9. Landlord receives payout (2-3 business days)
```

### For Landlords (Receiving Payments):

```
1. Landlord completes Stripe Connect onboarding
   ↓
2. Stripe Express account created
   ↓
3. stripe_account_id saved to payment_accounts
   ↓
4. When tenant pays, funds automatically route to landlord
   ↓
5. Stripe handles payouts to landlord's bank account
```

---

## Stripe API Keys Configuration

**Location**: `.env` file

```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY"
```

**Note**: This is a LIVE mode key (starts with `pk_live_`), meaning the application is processing real payments.

**Server-side keys** are stored in Supabase Edge Function environment variables:
- `STRIPE_SECRET_KEY` - Used by edge functions for API calls
- Referenced in: `fix_stripe_function.ts`, `supabase/functions/*/index.ts`

---

## Key Features Implemented

### 1. Multi-Payment Method Support
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- Bank accounts (ACH/ACSS Debit)
- Saved payment methods with default selection

### 2. Canadian Banking Integration
- Stripe Financial Connections for Canadian banks
- Support for 20+ Canadian financial institutions
- Real-time balance verification
- Secure OAuth-style bank login

### 3. Automated Landlord Payouts
- Stripe Connect Express accounts
- Embedded onboarding (no redirect)
- Automatic disbursements
- Balance tracking (available, pending, paid out)

### 4. Payment Security
- PCI-DSS compliant (Stripe handles card data)
- Prepaid card rejection
- Bank account verification
- Compliance confirmation checkboxes

### 5. Transaction History
- Full payment ledger for tenants
- Received payments dashboard for landlords
- Status tracking (pending, processing, paid, paid_to_landlord)
- Transaction IDs and timestamps

---

## Edge Functions (Serverless Payment Logic)

1. **`manage-financial-connections`**
   - Creates Financial Connections sessions
   - Exchanges bank accounts for payment methods
   - Handles Canadian bank integration

2. **`stripe-connect`**
   - Manages landlord onboarding
   - Creates Stripe Express accounts
   - Refreshes account status
   - Generates account links

3. **`execute-payment`**
   - Processes rent payments
   - Creates Payment Intents
   - Handles compliance checks

4. **`payment-webhook`** / **`stripe-webhook`**
   - Listens for Stripe events
   - Updates payment statuses
   - Handles account updates

---

## Services Layer

### `stripeService.ts`
- Customer creation
- Payment method attachment
- Payment Intent creation
- Subscription management

### `stripeAPIService.ts`
- Extended Stripe operations
- Account management
- Transfer handling

### `paymentService.ts`
- Business logic layer
- Database operations
- Payment orchestration

---

## Migration History

1. **`20241201_create_payment_system.sql`**
   - Initial payment infrastructure
   - Core tables and RLS policies
   - Platform fee calculations (2.5%)
   - Late fee logic (5-10%)

2. **`20241202_stripe_connect_onboarding.sql`**
   - Added Stripe Connect fields
   - `stripe_account_status` tracking
   - Onboarding completion timestamps

3. **`20240118_create_payment_methods.sql`**
   - Payment methods table
   - User-specific RLS policies

4. **`20240118_wallet_infrastructure.sql`**
   - Digital wallet features
   - Balance tracking

---

## Testing & Diagnostics

### Browser Console Scripts
- **`browser-verification.js`**: Tests Financial Connections session creation
- **`error-diagnostic.js`**: Diagnoses Stripe integration issues
- **`alternative-bank-connection.js`**: Fallback bank connection method

### Test Mode Support
- Detects test vs live keys
- Logs mode in console
- Separate test/live data isolation

---

## Current Status

✅ **Fully Implemented**:
- Stripe Payments API
- Stripe Financial Connections (Canadian banks)
- Stripe Connect (landlord payouts)
- Payment method storage
- Transaction history
- Auto-pay configuration

⚠️ **Potential Issues**:
- Some 404 errors mentioned in bank connection code comments
- Country filter issues (workarounds implemented)
- Prepaid card rejection logic

---

## Summary

**You are using Stripe exclusively for all payment processing.** The system is comprehensive and production-ready with:

- **3 Stripe Products**: Payments API, Financial Connections, Connect
- **Multiple Payment Types**: Cards (credit/debit) and bank accounts (ACH)
- **Canadian Market Focus**: Full support for Canadian banking system
- **Automated Payouts**: Landlords receive funds automatically
- **Security & Compliance**: PCI-DSS compliant, bank verification, KYC handling

**No other payment processors** (PayPal, Square, etc.) are integrated. Everything runs through Stripe.

---

## Recommendations

1. **Monitor Stripe Dashboard**: Check for failed payments, disputes, and account issues
2. **Test Mode**: Consider adding test mode toggle for development
3. **Error Handling**: Review 404 errors in Financial Connections
4. **Documentation**: Add user guides for bank connection process
5. **Webhooks**: Ensure webhook endpoints are properly configured in Stripe Dashboard
6. **API Version**: Currently using Stripe API version `2024-06-20` - keep updated

---

**Generated**: February 19, 2026  
**Investigation Scope**: Complete codebase payment integration analysis
