# Canadian PAD Payment System - Phase-by-Phase Tasks

## Task Breakdown by Phase

This document provides detailed task lists for each phase with file locations and specific actions.

---

## PHASE 1: Foundation & Infrastructure (Week 1)

### Task 1.1: Database Schema Updates
**Duration**: 2 days  
**Owner**: Backend Developer

**Files**:
- Create: `supabase/migrations/20260219_add_pad_support.sql`
- Create: `supabase/migrations/20260219_add_mandate_tracking.sql`

**Actions**:
```sql
-- Task 1.1.1: Update payment_methods table
ALTER TABLE payment_methods ADD COLUMN payment_type VARCHAR(20);
ALTER TABLE payment_methods ADD COLUMN mandate_id VARCHAR(255);
ALTER TABLE payment_methods ADD COLUMN mandate_status VARCHAR(50);
ALTER TABLE payment_methods ADD COLUMN mandate_accepted_at TIMESTAMP;
ALTER TABLE payment_methods ADD COLUMN bank_name VARCHAR(255);
ALTER TABLE payment_methods ADD COLUMN transit_number VARCHAR(10);
ALTER TABLE payment_methods ADD COLUMN institution_number VARCHAR(10);

-- Task 1.1.2: Update rent_payments table
ALTER TABLE rent_payments ADD COLUMN payment_method_type VARCHAR(20);
ALTER TABLE rent_payments ADD COLUMN transaction_fee DECIMAL(10,2);
ALTER TABLE rent_payments ADD COLUMN processing_days INTEGER;
ALTER TABLE rent_payments ADD COLUMN payment_cleared_at TIMESTAMP;
ALTER TABLE rent_payments ADD COLUMN expected_clear_date DATE;
ALTER TABLE rent_payments ADD COLUMN stripe_mandate_id VARCHAR(255);

-- Task 1.1.3: Add indexes
CREATE INDEX idx_payment_methods_type ON payment_methods(payment_type);
CREATE INDEX idx_rent_payments_method_type ON rent_payments(payment_method_type);
```

**Checklist**:
- [ ] Migration files created
- [ ] Tested in local database
- [ ] Applied to development database
- [ ] Applied to staging database
- [ ] Rollback script created
- [ ] Documentation updated

---

### Task 1.2: Fee Calculation Service
**Duration**: 1 day  
**Owner**: Backend Developer

**Files**:
- Create: `src/services/feeCalculationService.ts`
- Create: `src/services/feeCalculationService.test.ts`

**Actions**:
```typescript
// Task 1.2.1: Create service file
export interface PaymentFee {
  fee: number;
  total: number;
  percentage: string;
  fixed: string;
  processingTime: string;
  savings?: number;
}

// Task 1.2.2: Implement card fee calculation
export const calculateCardFee = (amount: number): PaymentFee => {
  const fee = (amount * 0.029) + 0.30;
  return {
    fee: parseFloat(fee.toFixed(2)),
    total: parseFloat((amount + fee).toFixed(2)),
    percentage: '2.9%',
    fixed: '$0.30',
    processingTime: 'Instant'
  };
};

// Task 1.2.3: Implement PAD fee calculation
export const calculatePadFee = (amount: number): PaymentFee => {
  const fee = (amount * 0.01) + 0.25;
  const cardFee = (amount * 0.029) + 0.30;
  return {
    fee: parseFloat(fee.toFixed(2)),
    total: parseFloat((amount + fee).toFixed(2)),
    percentage: '1%',
    fixed: '$0.25',
    processingTime: '3-5 business days',
    savings: parseFloat((cardFee - fee).toFixed(2))
  };
};

// Task 1.2.4: Write unit tests
```

**Checklist**:
- [ ] Service file created
- [ ] Card fee function implemented
- [ ] PAD fee function implemented
- [ ] Savings calculator implemented
- [ ] Unit tests written (100% coverage)
- [ ] All tests passing
- [ ] Exported from index

---

### Task 1.3: Type Definitions
**Duration**: 0.5 days  
**Owner**: Frontend Developer

**Files**:
- Create: `src/types/payment.ts`

**Actions**:
```typescript
// Task 1.3.1: Define payment types
export type PaymentMethodType = 'card' | 'acss_debit';

export interface PaymentFee {
  fee: number;
  total: number;
  percentage: string;
  fixed: string;
  processingTime: string;
  savings?: number;
}

export interface PadPaymentIntent {
  amount: number;
  currency: string;
  payment_method_types: string[];
  payment_method: string;
  customer: string;
  payment_method_options: {
    acss_debit: {
      mandate_options: {
        payment_schedule: string;
        interval_description: string;
        transaction_type: string;
      };
      verification_method: string;
    };
  };
  transfer_data: {
    destination: string;
    amount: number;
  };
  metadata: Record<string, string>;
}

export interface MandateDetails {
  id: string;
  status: string;
  payment_method: string;
  customer: string;
  accepted_at: string;
}

export type PaymentStatus = 
  | 'initiated'
  | 'processing'
  | 'clearing'
  | 'succeeded'
  | 'failed';
```

**Checklist**:
- [ ] Types file created
- [ ] All interfaces defined
- [ ] Enums created
- [ ] Exported properly
- [ ] Used in components

---

## PHASE 2: Tenant Payment Experience (Week 2-3)

### Task 2.1: Payment Method Selector Component
**Duration**: 2 days  
**Owner**: Frontend Developer

**Files**:
- Create: `src/components/payment/PaymentMethodSelector.tsx`
- Create: `src/components/payment/PaymentMethodSelector.test.tsx`

**Actions**:
```typescript
// Task 2.1.1: Create component structure
// Task 2.1.2: Add PAD card with fee display
// Task 2.1.3: Add Card card with fee display
// Task 2.1.4: Add savings calculator
// Task 2.1.5: Add selection logic
// Task 2.1.6: Add mobile responsive design
// Task 2.1.7: Add accessibility (ARIA labels)
// Task 2.1.8: Write component tests
```

**Checklist**:
- [ ] Component created
- [ ] PAD option displayed
- [ ] Card option displayed
- [ ] Fee calculation integrated
- [ ] Savings shown
- [ ] Selection works
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Tests passing

---

### Task 2.2: PAD Bank Connection Flow
**Duration**: 3 days  
**Owner**: Frontend Developer

**Files**:
- Create: `src/components/payment/PadBankConnection.tsx`
- Create: `src/components/payment/BankSelectionModal.tsx`
- Create: `src/components/payment/PadMandateAgreement.tsx`

**Actions**:
```typescript
// Task 2.2.1: Create bank selection modal
// Task 2.2.2: Integrate Financial Connections
// Task 2.2.3: Create mandate agreement screen
// Task 2.2.4: Add authorization checkbox
// Task 2.2.5: Add electronic signature
// Task 2.2.6: Save mandate to database
// Task 2.2.7: Handle errors
```

**Checklist**:
- [ ] Bank selection works
- [ ] Financial Connections integrated
- [ ] Mandate agreement displayed
- [ ] Authorization captured
- [ ] Mandate saved
- [ ] Error handling works
- [ ] Loading states shown

---

### Task 2.3: Payment Checkout
**Duration**: 2 days  
**Owner**: Frontend Developer

**Files**:
- Create: `src/components/payment/PaymentCheckout.tsx`
- Create: `src/components/payment/PadPaymentCheckout.tsx`
- Create: `src/components/payment/CardPaymentCheckout.tsx`

**Actions**:
```typescript
// Task 2.3.1: Create checkout wrapper
// Task 2.3.2: Create PAD checkout screen
// Task 2.3.3: Create Card checkout screen
// Task 2.3.4: Add fee breakdown
// Task 2.3.5: Add processing time warning
// Task 2.3.6: Add NSF warning (PAD)
// Task 2.3.7: Add confirmation logic
```

**Checklist**:
- [ ] Checkout screens created
- [ ] Fee breakdown shown
- [ ] Processing time displayed
- [ ] Warnings visible
- [ ] Confirmation works
- [ ] Different layouts for PAD/Card

---

### Task 2.4: Payment Status Tracking
**Duration**: 1 day  
**Owner**: Frontend Developer

**Files**:
- Create: `src/components/payment/PaymentStatusBadge.tsx`
- Create: `src/components/payment/PaymentTimeline.tsx`

**Actions**:
```typescript
// Task 2.4.1: Create status badge component
// Task 2.4.2: Add color coding
// Task 2.4.3: Create timeline component
// Task 2.4.4: Add progress indicator
// Task 2.4.5: Calculate days remaining
```

**Checklist**:
- [ ] Status badge created
- [ ] Colors correct
- [ ] Timeline component created
- [ ] Progress shown
- [ ] Days calculated correctly

---

## PHASE 3: Payment Processing Engine (Week 3-4)

### Task 3.1: PAD Payment Intent Creation
**Duration**: 3 days  
**Owner**: Backend Developer

**Files**:
- Create: `supabase/functions/execute-pad-payment/index.ts`

**Actions**:
```typescript
// Task 3.1.1: Create edge function file
// Task 3.1.2: Add Stripe initialization
// Task 3.1.3: Get rent ledger details
// Task 3.1.4: Get landlord Connect account
// Task 3.1.5: Calculate fees
// Task 3.1.6: Create PaymentIntent with acss_debit options (CRITICAL)
// Task 3.1.7: Save payment record
// Task 3.1.8: Return client_secret
// Task 3.1.9: Add error handling
// Task 3.1.10: Add logging
```

**Critical Code**:
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100),
  currency: 'cad',
  payment_method_types: ['acss_debit'],
  payment_method: payment_method_id,
  customer: customerId,
  
  // ⚠️ CRITICAL: Stripe requirement
  payment_method_options: {
    acss_debit: {
      mandate_options: {
        payment_schedule: 'interval',
        interval_description: 'Monthly rent payment',
        transaction_type: 'personal'
      },
      verification_method: 'instant'
    }
  },
  
  transfer_data: {
    destination: landlordAccount.stripe_account_id,
    amount: Math.round(rentAmount * 100)
  }
});
```

**Checklist**:
- [ ] Edge function created
- [ ] Stripe initialized
- [ ] PaymentIntent created
- [ ] acss_debit options passed
- [ ] Fees calculated
- [ ] Funds routed to landlord
- [ ] Database updated
- [ ] Error handling added
- [ ] Tested with Stripe test accounts

---

### Task 3.2: Card Payment Enhancement
**Duration**: 1 day  
**Owner**: Backend Developer

**Files**:
- Modify: `supabase/functions/execute-payment/index.ts`

**Actions**:
```typescript
// Task 3.2.1: Add payment type detection
// Task 3.2.2: Route to PAD or Card handler
// Task 3.2.3: Update fee calculation
// Task 3.2.4: Add payment_method_type to database
// Task 3.2.5: Maintain backward compatibility
```

**Checklist**:
- [ ] Routing logic added
- [ ] Both types work
- [ ] Fees correct
- [ ] Database updated
- [ ] Backward compatible

---

### Task 3.3: Payment Method Management
**Duration**: 2 days  
**Owner**: Backend Developer

**Files**:
- Modify: `supabase/functions/manage-financial-connections/index.ts`

**Actions**:
```typescript
// Task 3.3.1: Add ACSS Debit payment method creation
// Task 3.3.2: Create mandate
// Task 3.3.3: Attach to customer
// Task 3.3.4: Save to database
// Task 3.3.5: Return payment method details
```

**Checklist**:
- [ ] ACSS Debit creation works
- [ ] Mandate created
- [ ] Attached to customer
- [ ] Saved to database
- [ ] Details returned

---

### Task 3.4: Webhook Handlers
**Duration**: 2 days  
**Owner**: Backend Developer

**Files**:
- Modify: `supabase/functions/payment-webhook/index.ts`

**Actions**:
```typescript
// Task 3.4.1: Handle payment_intent.succeeded
// Task 3.4.2: Handle payment_intent.payment_failed
// Task 3.4.3: Handle payment_intent.processing
// Task 3.4.4: Handle mandate.updated
// Task 3.4.5: Handle mandate.revoked
// Task 3.4.6: Update database
// Task 3.4.7: Send notifications
```

**Checklist**:
- [ ] All events handled
- [ ] Database updates work
- [ ] Notifications sent
- [ ] Error handling robust
- [ ] Tested with Stripe CLI

---

## PHASE 4: Landlord Payout System (Week 4-5)

### Task 4.1: Stripe Connect Verification
**Duration**: 1 day  
**Owner**: Backend Developer

**Files**:
- Review: `supabase/functions/stripe-connect/index.ts`

**Actions**:
```typescript
// Task 4.1.1: Verify Canadian bank support
// Task 4.1.2: Test onboarding flow
// Task 4.1.3: Verify payout routing
// Task 4.1.4: Test balance tracking
```

**Checklist**:
- [ ] Canadian banks supported
- [ ] Onboarding works
- [ ] Payout routing verified
- [ ] Balance tracking accurate

---

### Task 4.2: Landlord Payment History
**Duration**: 2 days  
**Owner**: Frontend Developer

**Files**:
- Modify: `src/pages/dashboard/landlord/DigitalWallet.tsx`

**Actions**:
```typescript
// Task 4.2.1: Add payment method type column
// Task 4.2.2: Show processing status
// Task 4.2.3: Display expected payout date
// Task 4.2.4: Add filter by payment type
// Task 4.2.5: Update styling
```

**Checklist**:
- [ ] Payment type shown
- [ ] Status displayed
- [ ] Payout date visible
- [ ] Filters work
- [ ] Styling updated

---

### Task 4.3: Payout Timeline Display
**Duration**: 1 day  
**Owner**: Frontend Developer

**Files**:
- Create: `src/components/landlord/PayoutTimeline.tsx`

**Actions**:
```typescript
// Task 4.3.1: Create timeline component
// Task 4.3.2: Calculate dates
// Task 4.3.3: Show progress
// Task 4.3.4: Different timelines for PAD/Card
```

**Checklist**:
- [ ] Timeline component created
- [ ] Dates calculated
- [ ] Progress shown
- [ ] Different for PAD/Card

---

## PHASE 5: Integration & Testing (Week 5-6)

### Task 5.1: End-to-End Testing
**Duration**: 3 days  
**Owner**: QA Team

**Test Scenarios**:
```
Tenant Tests (10):
- T1-T10 from execution plan

System Tests (10):
- S1-S10 from execution plan

Landlord Tests (10):
- L1-L10 from execution plan
```

**Checklist**:
- [ ] All 30 tests passing
- [ ] Test reports generated
- [ ] Bugs logged and fixed

---

### Task 5.2: Error Scenario Testing
**Duration**: 2 days  
**Owner**: QA Team

**Test Cases**:
```
- NSF failures
- Invalid bank accounts
- Mandate revocations
- API errors
- Webhook failures
- Database errors
- Network timeouts
```

**Checklist**:
- [ ] All error scenarios tested
- [ ] Error handling works
- [ ] User-friendly messages shown

---

### Task 5.3: Deployment
**Duration**: 2 days  
**Owner**: DevOps + Team

**Steps**:
```
Day 1:
- Deploy database migrations
- Deploy edge functions
- Configure webhooks
- Test in production

Day 2:
- Deploy frontend
- Gradual rollout (10% → 50% → 100%)
- Monitor metrics
- Quick fixes if needed
```

**Checklist**:
- [ ] Database migrated
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Webhooks configured
- [ ] Monitoring active
- [ ] Rollout complete

---

**Task Breakdown Created**: February 19, 2026  
**Total Tasks**: 50+  
**Total Duration**: 6 weeks  
**Ready for**: Team assignment and execution
