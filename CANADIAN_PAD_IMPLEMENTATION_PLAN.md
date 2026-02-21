# Canadian PAD Payment System - Implementation Plan

## Executive Summary

This plan implements a clear, compliant Canadian Pre-Authorized Debit (PAD) payment system with transparent fee disclosure and proper Stripe ACSS Debit integration.

---

## Critical Requirements from Stripe

**Key Instruction**: Pass `payment_method_options.acss_debit` when creating PaymentIntents to offer Canadian Pre-Authorized Debit.

---

## Payment Methods Comparison

### 1. Card Payment (Credit/Debit Cards)
- **Transaction Fee**: 2.9% + $0.30 CAD per transaction
- **Processing Time**: Instant (funds available immediately)
- **Best For**: One-time payments, urgent payments
- **User Experience**: Immediate confirmation

### 2. Canadian Pre-Authorized Debit (PAD)
- **Transaction Fee**: 1% + $0.25 CAD per transaction (significantly lower)
- **Processing Time**: 3-5 business days to clear
- **Best For**: Recurring rent payments, cost-conscious tenants
- **User Experience**: Delayed confirmation, requires mandate

**Cost Example for $2,000 rent**:
- Card: $58.30 fee
- PAD: $20.25 fee
- **Savings: $38.05 per month with PAD**

---

## Phase 1: UI/UX Redesign - Payment Method Selection

### A. Tenant Payment Method Selection Screen

**Location**: `src/pages/dashboard/landlord/DigitalWallet.tsx` (Seeker view)

**New Design Structure**:

```
┌─────────────────────────────────────────────────────────┐
│  Choose Your Payment Method                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 💳 Card Payment (Credit/Debit)                   │  │
│  │                                                   │  │
│  │ ⚡ Instant Processing                            │  │
│  │ 💰 Fee: 2.9% + $0.30 CAD                        │  │
│  │ 📊 Example: $2,000 rent = $58.30 fee           │  │
│  │                                                   │  │
│  │ [Select Card Payment] ────────────────────────>  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🏦 Canadian Bank Account (PAD)    ⭐ RECOMMENDED │  │
│  │                                                   │  │
│  │ 💵 Lowest Fee: 1% + $0.25 CAD                   │  │
│  │ 📊 Example: $2,000 rent = $20.25 fee           │  │
│  │ ⏱️  Processing: 3-5 business days               │  │
│  │ 🔄 Perfect for monthly rent                     │  │
│  │                                                   │  │
│  │ [Select Bank Account] ─────────────────────────> │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  💡 Tip: Save $38/month on $2,000 rent with PAD        │
└─────────────────────────────────────────────────────────┘
```


### B. Payment Method Details Component

**New Component**: `src/components/payment/PaymentMethodSelector.tsx`

**Features**:
- Side-by-side comparison cards
- Real-time fee calculation based on rent amount
- Visual indicators (icons, badges)
- Clear processing time expectations
- Savings calculator

---

## Phase 2: Database Schema Updates

### A. Update `payment_methods` Table

**Migration**: `supabase/migrations/20260219_add_pad_support.sql`

```sql
-- Add PAD-specific fields
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) 
  CHECK (payment_type IN ('card', 'acss_debit', 'bank_account'));

ADD COLUMN IF NOT EXISTS mandate_id VARCHAR(255);
ADD COLUMN IF NOT EXISTS mandate_status VARCHAR(50);
ADD COLUMN IF NOT EXISTS mandate_accepted_at TIMESTAMP WITH TIME ZONE;
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ADD COLUMN IF NOT EXISTS transit_number VARCHAR(10);
ADD COLUMN IF NOT EXISTS institution_number VARCHAR(10);

-- Add fee tracking
ALTER TABLE rent_payments
ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(20);
ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10,2);
ADD COLUMN IF NOT EXISTS processing_days INTEGER;
```

### B. Update `rent_payments` Table

```sql
-- Add PAD-specific payment tracking
ALTER TABLE rent_payments
ADD COLUMN IF NOT EXISTS payment_cleared_at TIMESTAMP WITH TIME ZONE;
ADD COLUMN IF NOT EXISTS expected_clear_date DATE;
ADD COLUMN IF NOT EXISTS stripe_mandate_id VARCHAR(255);
```

---

## Phase 3: Backend Implementation

### A. Edge Function Updates

**File**: `supabase/functions/manage-financial-connections/index.ts`

**Changes Required**:

1. **Add ACSS Debit Payment Method Creation**:
```typescript
// When creating payment method, specify type
const paymentMethod = await stripe.paymentMethods.create({
  type: 'acss_debit',
  acss_debit: {
    account_number: accountNumber,
    institution_number: institutionNumber,
    transit_number: transitNumber
  },
  billing_details: {
    name: accountHolderName,
    email: user.email
  }
});
```

2. **Mandate Collection**:
```typescript
// Collect PAD mandate
const mandate = await stripe.mandates.create({
  payment_method: paymentMethod.id,
  customer: customerId
});
```

### B. New Edge Function: `execute-pad-payment`

**File**: `supabase/functions/execute-pad-payment/index.ts`

**Purpose**: Handle PAD-specific payment flow

**Key Logic**:
```typescript
// Create PaymentIntent with ACSS Debit options
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'cad',
  payment_method_types: ['acss_debit'],
  payment_method: savedPadMethodId,
  customer: stripeCustomerId,
  
  // CRITICAL: Stripe's requirement
  payment_method_options: {
    acss_debit: {
      mandate_options: {
        payment_schedule: 'interval',
        interval_description: 'Monthly rent payment',
        transaction_type: 'personal'
      },
      verification_method: 'instant' // or 'microdeposits'
    }
  },
  
  // Route to landlord's Connect account
  transfer_data: {
    destination: landlordStripeAccountId
  },
  
  metadata: {
    rent_ledger_id: ledgerId,
    tenant_id: tenantId,
    landlord_id: landlordId,
    payment_type: 'acss_debit'
  }
});
```

### C. Update `execute-payment` Function

**File**: `supabase/functions/execute-payment/index.ts`

**Add Payment Type Detection**:
```typescript
// Determine payment method type
const paymentMethodType = await determinePaymentType(paymentMethodId);

if (paymentMethodType === 'acss_debit') {
  // Use PAD-specific flow
  return await executePadPayment(params);
} else {
  // Use card payment flow
  return await executeCardPayment(params);
}
```

---

## Phase 4: Frontend Payment Flow

### A. PAD Bank Account Connection Flow

**Component**: `src/components/payment/PadBankConnection.tsx`

**Steps**:

1. **Bank Selection** (existing Financial Connections)
2. **Account Verification** (instant via Stripe)
3. **Mandate Agreement Display**:
```
┌─────────────────────────────────────────────────┐
│  Pre-Authorized Debit Agreement                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  I authorize Roomie AI to debit my bank        │
│  account for monthly rent payments.             │
│                                                  │
│  Bank: Royal Bank of Canada                     │
│  Account: ****1234                              │
│  Amount: $2,000.00 CAD (monthly)                │
│                                                  │
│  ✓ I understand payments take 3-5 days         │
│  ✓ I can cancel this authorization anytime     │
│  ✓ Transaction fee: 1% + $0.25 CAD            │
│                                                  │
│  [Cancel]  [Authorize PAD Payments]            │
└─────────────────────────────────────────────────┘
```

4. **Confirmation & Save**

### B. Payment Execution Screen

**Component**: `src/components/payment/PaymentCheckout.tsx`

**For PAD Payments**:
```
┌─────────────────────────────────────────────────┐
│  Confirm Rent Payment                           │
├─────────────────────────────────────────────────┤
│                                                  │
│  Payment Method: 🏦 RBC ****1234 (PAD)         │
│                                                  │
│  Rent Amount:        $2,000.00                  │
│  Transaction Fee:       $20.25 (1%)             │
│  ─────────────────────────────────              │
│  Total:              $2,020.25                  │
│                                                  │
│  ⏱️  Processing Time: 3-5 business days         │
│  📅 Expected Clear Date: Feb 24, 2026          │
│                                                  │
│  ⚠️  Ensure sufficient funds in your account   │
│                                                  │
│  [Cancel]  [Confirm Payment]                    │
└─────────────────────────────────────────────────┘
```

**For Card Payments**:
```
┌─────────────────────────────────────────────────┐
│  Confirm Rent Payment                           │
├─────────────────────────────────────────────────┤
│                                                  │
│  Payment Method: 💳 Visa ****4242              │
│                                                  │
│  Rent Amount:        $2,000.00                  │
│  Transaction Fee:       $58.30 (2.9% + $0.30)  │
│  ─────────────────────────────────────          │
│  Total:              $2,058.30                  │
│                                                  │
│  ⚡ Instant Processing                          │
│  ✅ Immediate Confirmation                      │
│                                                  │
│  [Cancel]  [Pay Now]                            │
└─────────────────────────────────────────────────┘
```

---

## Phase 5: Payment Status Tracking

### A. Payment Status States

**For PAD Payments**:
1. `initiated` - Payment created
2. `processing` - Sent to bank (0-1 day)
3. `clearing` - Bank processing (2-4 days)
4. `succeeded` - Funds cleared
5. `failed` - Insufficient funds or error

**For Card Payments**:
1. `processing` - Stripe processing
2. `succeeded` - Immediate
3. `failed` - Declined

### B. Status Display Component

**Component**: `src/components/payment/PaymentStatusBadge.tsx`

**Visual Indicators**:
- PAD Processing: Orange badge with clock icon
- PAD Clearing: Blue badge with progress indicator
- PAD Succeeded: Green badge with checkmark
- Card Succeeded: Green badge (instant)

---

## Phase 6: Landlord Payout Flow

### A. Stripe Connect Account Setup

**Already Implemented**: Landlords onboard via Stripe Connect Express

**Enhancement Needed**: Ensure Canadian bank account collection

### B. Automatic Fund Routing

**Implementation**:

1. **Destination Charges** (Recommended):
```typescript
// In PaymentIntent creation
transfer_data: {
  destination: landlordStripeAccountId,
  amount: rentAmount // Platform keeps the fee
}
```

2. **Platform Fee Calculation**:
```typescript
const platformFee = calculatePlatformFee(rentAmount, paymentType);
// PAD: Keep difference between 1% charged and actual Stripe fee
// Card: Keep difference between 2.9% charged and actual Stripe fee
```

### C. Payout Timeline

**For PAD Payments**:
- Day 0: Tenant initiates payment
- Day 3-5: Payment clears from tenant's bank
- Day 6-8: Stripe transfers to landlord's Connect account
- Day 8-10: Landlord receives payout to their bank

**For Card Payments**:
- Day 0: Tenant pays (instant)
- Day 2-3: Stripe transfers to landlord's Connect account
- Day 4-5: Landlord receives payout

---

## Phase 7: Fee Transparency & Disclosure

### A. Fee Calculation Service

**File**: `src/services/feeCalculationService.ts`

```typescript
export const calculatePaymentFees = (
  rentAmount: number,
  paymentType: 'card' | 'acss_debit'
) => {
  if (paymentType === 'card') {
    const fee = (rentAmount * 0.029) + 0.30;
    return {
      fee: parseFloat(fee.toFixed(2)),
      total: rentAmount + fee,
      percentage: '2.9%',
      fixed: '$0.30',
      processingTime: 'Instant'
    };
  } else {
    const fee = (rentAmount * 0.01) + 0.25;
    return {
      fee: parseFloat(fee.toFixed(2)),
      total: rentAmount + fee,
      percentage: '1%',
      fixed: '$0.25',
      processingTime: '3-5 business days'
    };
  }
};
```

### B. Fee Disclosure Component

**Component**: `src/components/payment/FeeDisclosure.tsx`

**Always Visible**:
- Before payment method selection
- During payment confirmation
- In payment history

---

## Phase 8: Compliance & Legal

### A. PAD Mandate Agreement

**File**: `src/components/payment/PadMandateAgreement.tsx`

**Required Elements** (Canadian PAD Rules):
1. Authorization statement
2. Payor information
3. Payee information (Roomie AI)
4. Payment amount and frequency
5. Cancellation rights
6. Dispute resolution process
7. Date and signature (electronic)

### B. Terms of Service Updates

**Add Section**: "Pre-Authorized Debit Payments"
- Clearing times
- NSF fee responsibility
- Cancellation process
- Dispute handling

---

## Phase 9: Error Handling & Edge Cases

### A. NSF (Non-Sufficient Funds)

**Webhook Handler**: `supabase/functions/payment-webhook/index.ts`

```typescript
if (event.type === 'payment_intent.payment_failed') {
  const reason = event.data.object.last_payment_error?.code;
  
  if (reason === 'insufficient_funds') {
    // Notify tenant
    // Mark payment as failed
    // Optionally retry or request alternate payment method
  }
}
```

### B. Mandate Revocation

**Handle**: Tenant cancels PAD authorization
- Stripe webhook: `mandate.updated`
- Disable auto-pay
- Notify tenant and landlord
- Request new payment method

### C. Bank Account Changes

**Flow**:
1. Tenant updates bank account
2. New mandate required
3. Old mandate automatically revoked
4. Verification process

---

## Phase 10: Testing Strategy

### A. Test Mode Setup

**Stripe Test Bank Accounts**:
- Success: `000123456789` (institution: 000)
- Insufficient Funds: `000111111116`
- Invalid Account: `000999999999`

### B. Test Scenarios

1. ✅ PAD payment success (full flow)
2. ✅ PAD payment NSF failure
3. ✅ Card payment success
4. ✅ Card payment decline
5. ✅ Mandate creation and storage
6. ✅ Mandate revocation
7. ✅ Fee calculation accuracy
8. ✅ Landlord payout routing
9. ✅ Multi-tenant payment handling
10. ✅ Payment status updates

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema updates
- [ ] Fee calculation service
- [ ] Payment method comparison UI

### Week 2: PAD Integration
- [ ] Update edge functions with `payment_method_options.acss_debit`
- [ ] Mandate collection flow
- [ ] Bank account connection UI

### Week 3: Payment Execution
- [ ] PAD payment flow
- [ ] Card payment flow (existing, enhance)
- [ ] Payment confirmation screens

### Week 4: Status & Tracking
- [ ] Payment status tracking
- [ ] Webhook handlers
- [ ] Email notifications

### Week 5: Landlord Side
- [ ] Payout routing verification
- [ ] Dashboard updates
- [ ] Balance tracking

### Week 6: Testing & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] UI/UX refinements
- [ ] Documentation

---

## Key Files to Modify

### Frontend:
1. `src/pages/dashboard/landlord/DigitalWallet.tsx` - Main payment UI
2. `src/components/payment/PaymentMethodSelector.tsx` - NEW
3. `src/components/payment/PadBankConnection.tsx` - NEW
4. `src/components/payment/PaymentCheckout.tsx` - NEW
5. `src/components/payment/FeeDisclosure.tsx` - NEW
6. `src/services/feeCalculationService.ts` - NEW

### Backend:
1. `supabase/functions/execute-payment/index.ts` - Update
2. `supabase/functions/execute-pad-payment/index.ts` - NEW
3. `supabase/functions/manage-financial-connections/index.ts` - Update
4. `supabase/functions/payment-webhook/index.ts` - Update

### Database:
1. `supabase/migrations/20260219_add_pad_support.sql` - NEW
2. `supabase/migrations/20260219_add_mandate_tracking.sql` - NEW

---

## Success Metrics

1. **Fee Transparency**: 100% of users see fees before payment
2. **PAD Adoption**: Target 60%+ of recurring payments via PAD
3. **Payment Success Rate**: >95% for both methods
4. **User Satisfaction**: Clear understanding of processing times
5. **Cost Savings**: Average $35/month savings for PAD users

---

## Risk Mitigation

### Risk 1: PAD Processing Delays
**Mitigation**: Clear communication of 3-5 day timeline, send status updates

### Risk 2: NSF Failures
**Mitigation**: Balance verification before payment, NSF fee disclosure

### Risk 3: User Confusion
**Mitigation**: Side-by-side comparison, savings calculator, tooltips

### Risk 4: Mandate Compliance
**Mitigation**: Use Stripe's built-in mandate handling, legal review

---

## Next Steps

1. **Review this plan** with your team
2. **Confirm Stripe account** has ACSS Debit enabled
3. **Legal review** of PAD mandate agreement
4. **Design mockups** for payment method selection UI
5. **Set up test environment** with Stripe test mode
6. **Begin Week 1 implementation**

---

**Plan Created**: February 19, 2026  
**Estimated Completion**: 6 weeks  
**Priority**: CRITICAL - Core payment functionality
