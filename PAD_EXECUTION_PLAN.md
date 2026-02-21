# Canadian PAD Payment System - Execution Plan

## Overview

This execution plan breaks down the implementation into **5 major phases**, organized by stakeholder perspective: **Tenant Side**, **System Side**, and **Landlord Side**.

---

## Phase Structure

```
PHASE 1: Foundation & Infrastructure (System Side)
    ↓
PHASE 2: Tenant Payment Experience (Tenant Side)
    ↓
PHASE 3: Payment Processing Engine (System Side)
    ↓
PHASE 4: Landlord Payout System (Landlord Side)
    ↓
PHASE 5: Integration & Testing (All Sides)
```

---

## PHASE 1: Foundation & Infrastructure (Week 1)
**Focus**: System Side - Database, Services, Core Logic

### 1.1 Database Schema Updates

**Files to Create/Modify**:
- `supabase/migrations/20260219_add_pad_support.sql`
- `supabase/migrations/20260219_add_mandate_tracking.sql`

**Tasks**:
```sql
-- payment_methods table updates
- Add payment_type column (card, acss_debit)
- Add mandate_id, mandate_status columns
- Add mandate_accepted_at timestamp
- Add bank_name, transit_number, institution_number
- Add indexes for performance

-- rent_payments table updates
- Add payment_method_type column
- Add transaction_fee column
- Add processing_days column
- Add payment_cleared_at timestamp
- Add expected_clear_date column
- Add stripe_mandate_id column

-- Create fee_structure table (optional)
- Store dynamic fee configurations
```

**Deliverables**:
- ✅ Migration files created
- ✅ Tested in development
- ✅ Rollback scripts prepared
- ✅ Applied to staging database



### 1.2 Fee Calculation Service

**Files to Create**:
- `src/services/feeCalculationService.ts`
- `src/services/feeCalculationService.test.ts`

**Tasks**:
```typescript
- Create calculatePaymentFees() function
- Card fee logic: 2.9% + $0.30
- PAD fee logic: 1% + $0.25
- Savings calculator
- Expected clear date calculator
- Unit tests (100% coverage)
```

**Deliverables**:
- ✅ Service implemented
- ✅ All tests passing
- ✅ Exported and ready for use

### 1.3 Type Definitions

**Files to Create/Modify**:
- `src/types/payment.ts`

**Tasks**:
```typescript
- PaymentMethodType enum
- PaymentFee interface
- PadPaymentIntent interface
- MandateDetails interface
- PaymentStatus enum
```

**Deliverables**:
- ✅ Types defined
- ✅ Imported across codebase

---

## PHASE 2: Tenant Payment Experience (Week 2-3)
**Focus**: Tenant Side - UI/UX for Payment Selection & Execution

### 2.1 Payment Method Selection UI

**Files to Create**:
- `src/components/payment/PaymentMethodSelector.tsx`
- `src/components/payment/PaymentMethodSelector.test.tsx`
- `src/components/payment/FeeDisclosure.tsx`

**Tasks**:
```
TENANT SEES:
┌─────────────────────────────────────────┐
│ Choose Your Payment Method              │
├─────────────────────────────────────────┤
│                                          │
│ [🏦 Bank Account (PAD)] ⭐ RECOMMENDED  │
│ • Lowest Fee: 1% + $0.25                │
│ • Save $38/month on $2,000 rent         │
│ • Processing: 3-5 days                  │
│                                          │
│ [💳 Credit/Debit Card]                  │
│ • Fee: 2.9% + $0.30                     │
│ • Instant processing                    │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Side-by-side comparison cards
- Real-time fee calculation based on rent amount
- Visual savings indicator
- Processing time badges
- Mobile responsive design
- Accessibility compliant

**Deliverables**:
- ✅ Component built
- ✅ Integrated into DigitalWallet page
- ✅ Tests passing
- ✅ Design approved

### 2.2 PAD Bank Connection Flow

**Files to Create**:
- `src/components/payment/PadBankConnection.tsx`
- `src/components/payment/BankSelectionModal.tsx`
- `src/components/payment/PadMandateAgreement.tsx`

**Tasks**:
```
TENANT FLOW:
1. Click "Connect Bank Account"
   ↓
2. Select Bank (RBC, TD, Scotiabank, etc.)
   ↓
3. Stripe Financial Connections Modal Opens
   ↓
4. Tenant logs into bank (OAuth)
   ↓
5. Bank account verified
   ↓
6. PAD Mandate Agreement displayed
   ↓
7. Tenant authorizes PAD
   ↓
8. Payment method saved
```

**Implementation**:
- Reuse existing Financial Connections integration
- Add PAD mandate agreement screen
- Electronic signature capture
- Mandate terms display
- Cancellation rights disclosure
- Save mandate to database

**Deliverables**:
- ✅ Bank connection working
- ✅ Mandate agreement displayed
- ✅ Authorization captured
- ✅ Payment method saved

### 2.3 Payment Checkout & Confirmation

**Files to Create**:
- `src/components/payment/PaymentCheckout.tsx`
- `src/components/payment/PadPaymentCheckout.tsx`
- `src/components/payment/CardPaymentCheckout.tsx`

**Tasks**:
```
TENANT SEES (PAD):
┌─────────────────────────────────────────┐
│ Confirm Rent Payment                    │
├─────────────────────────────────────────┤
│ Payment Method: 🏦 RBC ****1234         │
│                                          │
│ Rent Amount:        $2,000.00           │
│ Transaction Fee:       $20.25           │
│ ─────────────────────────────────       │
│ Total:              $2,020.25           │
│                                          │
│ ⏱️ Processing: 3-5 business days        │
│ 📅 Expected Clear: Feb 24, 2026         │
│                                          │
│ ⚠️ Ensure sufficient funds              │
│                                          │
│ [Cancel]  [Confirm Payment]             │
└─────────────────────────────────────────┘
```

**Implementation**:
- Different layouts for PAD vs Card
- Fee breakdown display
- Total calculation
- Processing time warning
- Expected clear date
- NSF warning for PAD
- Confirmation checklist

**Deliverables**:
- ✅ Checkout UI complete
- ✅ Fee display accurate
- ✅ Warnings visible
- ✅ Confirmation works

### 2.4 Payment Status Tracking

**Files to Create**:
- `src/components/payment/PaymentStatusBadge.tsx`
- `src/components/payment/PaymentTimeline.tsx`

**Tasks**:
```
TENANT SEES:
Payment Status: 🟡 Processing (Day 2 of 5)
Expected Clear Date: Feb 24, 2026

Timeline:
✅ Payment Initiated - Feb 19
🟡 Bank Processing - Feb 20-23
⏳ Payment Clearing - Feb 24
⏳ Landlord Transfer - Feb 25-27
```

**Implementation**:
- Status badges with colors
- Progress timeline
- Day counter
- Email notifications
- Push notifications (optional)

**Deliverables**:
- ✅ Status display working
- ✅ Timeline accurate
- ✅ Notifications sent

---

## PHASE 3: Payment Processing Engine (Week 3-4)
**Focus**: System Side - Backend Payment Logic

### 3.1 PAD Payment Intent Creation

**Files to Create**:
- `supabase/functions/execute-pad-payment/index.ts`

**Tasks**:
```typescript
CRITICAL IMPLEMENTATION:
- Create PaymentIntent with payment_method_types: ['acss_debit']
- Pass payment_method_options.acss_debit (STRIPE REQUIREMENT)
- Set mandate_options (payment_schedule, interval_description)
- Configure verification_method: 'instant'
- Add transfer_data for landlord routing
- Store metadata (tenant_id, landlord_id, rent_ledger_id)
- Calculate and apply fees
- Set expected_clear_date
```

**Deliverables**:
- ✅ Edge function created
- ✅ Stripe integration working
- ✅ payment_method_options.acss_debit passed correctly
- ✅ Tested with Stripe test accounts

### 3.2 Card Payment Enhancement

**Files to Modify**:
- `supabase/functions/execute-payment/index.ts`

**Tasks**:
```typescript
- Add payment type detection
- Route to PAD or Card handler
- Update fee calculation
- Maintain existing card logic
- Add payment_method_type to database
```

**Deliverables**:
- ✅ Routing logic added
- ✅ Both payment types work
- ✅ Backward compatible

### 3.3 Payment Method Management

**Files to Modify**:
- `supabase/functions/manage-financial-connections/index.ts`

**Tasks**:
```typescript
- Create ACSS Debit payment method
- Attach to Stripe Customer
- Create and store mandate
- Save to payment_methods table
- Include bank details (name, last4)
```

**Deliverables**:
- ✅ ACSS Debit payment method creation
- ✅ Mandate handling
- ✅ Database storage

### 3.4 Webhook Handlers

**Files to Modify**:
- `supabase/functions/payment-webhook/index.ts`

**Tasks**:
```typescript
Handle Events:
- payment_intent.succeeded (PAD cleared)
- payment_intent.payment_failed (NSF)
- payment_intent.processing (PAD initiated)
- mandate.updated (mandate status change)
- mandate.revoked (tenant cancelled)

Actions:
- Update payment status in database
- Send notifications
- Trigger landlord payout
- Handle NSF failures
```

**Deliverables**:
- ✅ All webhook events handled
- ✅ Database updates working
- ✅ Notifications sent
- ✅ Error handling robust

---

## PHASE 4: Landlord Payout System (Week 4-5)
**Focus**: Landlord Side - Receiving Payments

### 4.1 Stripe Connect Verification

**Files to Review**:
- `supabase/functions/stripe-connect/index.ts`
- `src/pages/dashboard/landlord/DigitalWallet.tsx`

**Tasks**:
```
LANDLORD SEES:
┌─────────────────────────────────────────┐
│ Landlord Wallet                         │
├─────────────────────────────────────────┤
│ Available Balance:    $2,000.00         │
│ Pending Balance:      $2,000.00         │
│ Total Paid Out:      $10,000.00         │
│                                          │
│ Next Payout: Automatic (2-3 days)       │
│                                          │
│ ✅ Bank Account Connected               │
│ [Manage Payouts]                        │
└─────────────────────────────────────────┘
```

**Verification**:
- Ensure Stripe Connect onboarding works
- Verify Canadian bank account collection
- Test payout routing
- Confirm balance tracking

**Deliverables**:
- ✅ Connect onboarding verified
- ✅ Canadian banks supported
- ✅ Payout routing tested

### 4.2 Payment Routing Configuration

**Files to Modify**:
- `supabase/functions/execute-pad-payment/index.ts`
- `supabase/functions/execute-payment/index.ts`

**Tasks**:
```typescript
Configure Destination Charges:
- transfer_data.destination = landlord_stripe_account_id
- transfer_data.amount = rent_amount (platform keeps fee)
- Verify funds route correctly
- Test with multiple landlords
```

**Deliverables**:
- ✅ Destination charges configured
- ✅ Funds route to correct landlord
- ✅ Platform fee retained

### 4.3 Landlord Payment History

**Files to Modify**:
- `src/pages/dashboard/landlord/DigitalWallet.tsx`

**Tasks**:
```
LANDLORD SEES:
Payment History:
┌──────────────────────────────────────────┐
│ Date       Tenant      Amount    Status  │
├──────────────────────────────────────────┤
│ Feb 19  John Smith  $2,000  Processing   │
│ Feb 15  Jane Doe    $1,800  Completed    │
│ Feb 10  Bob Jones   $2,200  Completed    │
└──────────────────────────────────────────┘

Payment Method Types:
• PAD payments: Show "Processing (3-5 days)"
• Card payments: Show "Completed (Instant)"
```

**Implementation**:
- Display payment method type
- Show processing status
- Indicate expected payout date
- Filter by payment type

**Deliverables**:
- ✅ Payment history updated
- ✅ Payment types visible
- ✅ Status accurate

### 4.4 Payout Timeline Display

**Files to Create**:
- `src/components/landlord/PayoutTimeline.tsx`

**Tasks**:
```
LANDLORD SEES:
Payout Timeline for $2,000 (PAD):
✅ Tenant Paid - Feb 19
🟡 Payment Clearing - Feb 19-24 (3-5 days)
⏳ Transfer to Your Account - Feb 25-27
⏳ Bank Payout - Feb 28-Mar 2

Total Time: 8-10 business days
```

**Deliverables**:
- ✅ Timeline component created
- ✅ Accurate date calculations
- ✅ Different timelines for PAD vs Card

---

## PHASE 5: Integration & Testing (Week 5-6)
**Focus**: All Sides - End-to-End Testing & Deployment

### 5.1 End-to-End Testing

**Test Scenarios**:

#### Tenant Side Tests:
```
✅ T1: Select PAD payment method
✅ T2: Connect bank account via Financial Connections
✅ T3: Authorize PAD mandate
✅ T4: View fee comparison (PAD vs Card)
✅ T5: Confirm PAD payment
✅ T6: See processing status
✅ T7: Receive payment confirmation email
✅ T8: View payment in history
✅ T9: Select Card payment method
✅ T10: Complete card payment (instant)
```

#### System Side Tests:
```
✅ S1: Create ACSS Debit payment method
✅ S2: Store mandate in database
✅ S3: Create PaymentIntent with acss_debit options
✅ S4: Process PAD payment (3-5 day simulation)
✅ S5: Handle payment_intent.succeeded webhook
✅ S6: Handle payment_intent.payment_failed (NSF)
✅ S7: Route funds to landlord Connect account
✅ S8: Calculate fees correctly
✅ S9: Update payment status
✅ S10: Send notifications
```

#### Landlord Side Tests:
```
✅ L1: Receive payment notification
✅ L2: See payment in history
✅ L3: View payment method type (PAD vs Card)
✅ L4: See processing status
✅ L5: View expected payout date
✅ L6: Receive payout to bank account
✅ L7: Balance updates correctly
✅ L8: Payout timeline accurate
✅ L9: Multiple tenant payments
✅ L10: Mixed payment types (PAD + Card)
```

### 5.2 Error Scenario Testing

**Test Cases**:
```
❌ E1: NSF - Insufficient funds in tenant account
❌ E2: Invalid bank account
❌ E3: Mandate revoked by tenant
❌ E4: Stripe API error
❌ E5: Webhook delivery failure
❌ E6: Database connection error
❌ E7: Landlord Connect account not set up
❌ E8: Payment amount mismatch
❌ E9: Duplicate payment attempt
❌ E10: Network timeout
```

### 5.3 Performance Testing

**Metrics to Test**:
```
⚡ Payment method selection: < 1 second
⚡ Bank connection: < 5 seconds
⚡ Payment confirmation: < 2 seconds
⚡ Webhook processing: < 3 seconds
⚡ Database queries: < 500ms
⚡ Page load time: < 2 seconds
⚡ Mobile responsiveness: All screens
```

### 5.4 User Acceptance Testing

**UAT Checklist**:
```
👥 Tenant UAT:
- Can easily understand fee differences
- Finds PAD option clearly marked
- Bank connection is smooth
- Mandate agreement is clear
- Payment confirmation is reassuring
- Status updates are informative

👥 Landlord UAT:
- Receives payment notifications
- Understands processing times
- Payout timeline is clear
- Balance tracking is accurate
- Can manage multiple tenants
```

### 5.5 Deployment Plan

**Deployment Steps**:

```
STEP 1: Pre-Deployment (Day 1)
- Code review completed
- All tests passing
- Staging environment tested
- Database backup created
- Rollback plan documented

STEP 2: Database Migration (Day 1)
- Apply migrations to production
- Verify schema changes
- Test database queries

STEP 3: Backend Deployment (Day 2)
- Deploy edge functions
- Configure webhooks in Stripe
- Test webhook delivery
- Monitor error logs

STEP 4: Frontend Deployment (Day 2)
- Deploy frontend changes
- Clear CDN cache
- Test in production
- Monitor user sessions

STEP 5: Smoke Testing (Day 2-3)
- Test with real $1 transaction
- Verify end-to-end flow
- Check webhook delivery
- Confirm payout routing

STEP 6: Gradual Rollout (Day 3-7)
- Enable for 10% of users
- Monitor metrics
- Increase to 50%
- Full rollout if stable

STEP 7: Post-Deployment (Week 2)
- Monitor all transactions
- Review error logs daily
- Collect user feedback
- Quick bug fixes
```

---

## Execution Summary by Stakeholder

### TENANT SIDE (What Tenants Experience)

**Phase 2 Deliverables**:
1. ✅ Clear payment method selection with fee comparison
2. ✅ Easy bank account connection
3. ✅ Simple PAD mandate authorization
4. ✅ Transparent fee disclosure
5. ✅ Payment confirmation with timeline
6. ✅ Status tracking throughout process
7. ✅ Email notifications

**Tenant Benefits**:
- Save $38/month on $2,000 rent with PAD
- Clear understanding of fees
- Know exactly when payment will clear
- Easy bank connection (no manual entry)
- Secure mandate handling

---

### SYSTEM SIDE (Backend Infrastructure)

**Phase 1 Deliverables**:
1. ✅ Database schema updated
2. ✅ Fee calculation service
3. ✅ Type definitions

**Phase 3 Deliverables**:
1. ✅ PAD payment processing with acss_debit options
2. ✅ Card payment enhancement
3. ✅ Payment method management
4. ✅ Webhook handlers for all events
5. ✅ Error handling and logging
6. ✅ Notification system

**System Capabilities**:
- Process both PAD and Card payments
- Handle Stripe webhooks
- Route funds to landlords
- Track payment status
- Calculate fees accurately
- Send notifications

---

### LANDLORD SIDE (What Landlords Experience)

**Phase 4 Deliverables**:
1. ✅ Stripe Connect verification
2. ✅ Payment routing configuration
3. ✅ Payment history with types
4. ✅ Payout timeline display
5. ✅ Balance tracking
6. ✅ Automatic payouts

**Landlord Benefits**:
- Automatic payouts to bank
- Clear payment tracking
- Know when to expect funds
- See payment method types
- No manual intervention needed
- Transparent fee structure

---

## Timeline Overview

```
Week 1: PHASE 1 - Foundation (System)
Week 2: PHASE 2 - Tenant UI (Tenant)
Week 3: PHASE 3 - Payment Engine (System)
Week 4: PHASE 4 - Landlord Payouts (Landlord)
Week 5: PHASE 5 - Testing (All)
Week 6: PHASE 5 - Deployment (All)
```

---

## Success Criteria

### Tenant Side Success:
- ✅ 90%+ tenants understand fee differences
- ✅ 60%+ choose PAD for recurring payments
- ✅ < 5% payment failures
- ✅ 4.5+ star rating for payment experience

### System Side Success:
- ✅ 99.9% uptime
- ✅ < 2 second payment processing
- ✅ 100% webhook delivery
- ✅ Zero data loss
- ✅ < 1% error rate

### Landlord Side Success:
- ✅ 100% payout accuracy
- ✅ Payouts within expected timeline
- ✅ Clear payment tracking
- ✅ 4.5+ star rating for payout experience

---

## Risk Mitigation by Phase

### Phase 1 Risks:
- Database migration failure → Rollback scripts ready
- Schema conflicts → Test in staging first

### Phase 2 Risks:
- User confusion → Clear UI/UX, tooltips, help text
- Bank connection issues → Fallback to manual entry

### Phase 3 Risks:
- Stripe API errors → Retry logic, error handling
- Webhook failures → Queue system, manual retry

### Phase 4 Risks:
- Payout routing errors → Test with small amounts first
- Balance discrepancies → Reconciliation process

### Phase 5 Risks:
- Production bugs → Gradual rollout, monitoring
- Performance issues → Load testing, optimization

---

**Execution Plan Created**: February 19, 2026  
**Total Phases**: 5  
**Total Duration**: 6 weeks  
**Stakeholders**: Tenant, System, Landlord  
**Status**: Ready for approval and execution
