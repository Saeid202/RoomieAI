# Canadian PAD Implementation Checklist

## Pre-Implementation

### Stripe Account Setup
- [ ] Verify Stripe account has ACSS Debit enabled
- [ ] Confirm Canadian business registration with Stripe
- [ ] Test mode credentials configured
- [ ] Live mode credentials ready
- [ ] Webhook endpoints configured

### Legal & Compliance
- [ ] PAD mandate agreement drafted
- [ ] Legal review completed
- [ ] Terms of Service updated
- [ ] Privacy policy updated (bank account data)
- [ ] NSF fee policy defined

### Design & UX
- [ ] Payment method comparison mockups
- [ ] Fee disclosure designs
- [ ] Processing timeline visuals
- [ ] Mobile responsive designs
- [ ] Accessibility review

---

## Phase 1: Database (Week 1)

### Schema Updates
- [ ] Create migration: `20260219_add_pad_support.sql`
- [ ] Add `payment_type` column to `payment_methods`
- [ ] Add `mandate_id`, `mandate_status` columns
- [ ] Add `bank_name`, `transit_number`, `institution_number`
- [ ] Add `transaction_fee` to `rent_payments`
- [ ] Add `payment_method_type` to `rent_payments`
- [ ] Add `expected_clear_date` to `rent_payments`
- [ ] Add `payment_cleared_at` timestamp
- [ ] Test migration in development
- [ ] Backup production database
- [ ] Run migration in production

---

## Phase 2: Backend (Week 2-3)

### Edge Functions

#### `execute-payment` Updates
- [ ] Add payment type detection logic
- [ ] Route to card vs PAD handlers
- [ ] Update error handling
- [ ] Add logging for debugging
- [ ] Test with both payment types

#### New `execute-pad-payment` Function
- [ ] Create function file
- [ ] Implement PaymentIntent creation with `payment_method_options.acss_debit`
- [ ] Add mandate handling
- [ ] Implement destination charges
- [ ] Add metadata tracking
- [ ] Error handling for NSF
- [ ] Test with Stripe test accounts
- [ ] Deploy to staging
- [ ] Deploy to production

#### `manage-financial-connections` Updates
- [ ] Add ACSS Debit payment method creation
- [ ] Implement mandate collection
- [ ] Store mandate ID in database
- [ ] Test bank account connection
- [ ] Test mandate authorization

#### `payment-webhook` Updates
- [ ] Handle `payment_intent.succeeded` for PAD
- [ ] Handle `payment_intent.payment_failed` (NSF)
- [ ] Handle `mandate.updated` events
- [ ] Update payment status in database
- [ ] Send notifications
- [ ] Test webhook locally
- [ ] Configure webhook in Stripe Dashboard

### Services

#### New `feeCalculationService.ts`
- [ ] Create service file
- [ ] Implement card fee calculation (2.9% + $0.30)
- [ ] Implement PAD fee calculation (1% + $0.25)
- [ ] Add savings calculator
- [ ] Add unit tests
- [ ] Export functions

---

## Phase 3: Frontend (Week 3-4)

### Components

#### `PaymentMethodSelector.tsx` (NEW)
- [ ] Create component file
- [ ] Design side-by-side comparison cards
- [ ] Add fee display
- [ ] Add processing time display
- [ ] Add savings calculator
- [ ] Add "Recommended" badge for PAD
- [ ] Mobile responsive layout
- [ ] Accessibility (ARIA labels)
- [ ] Unit tests

#### `PadBankConnection.tsx` (NEW)
- [ ] Create component file
- [ ] Integrate Stripe Financial Connections
- [ ] Bank selection UI
- [ ] Account verification flow
- [ ] Mandate agreement display
- [ ] Authorization checkbox
- [ ] Confirmation screen
- [ ] Error handling
- [ ] Loading states

#### `PaymentCheckout.tsx` (NEW)
- [ ] Create component file
- [ ] Payment summary display
- [ ] Fee breakdown
- [ ] Total calculation
- [ ] Processing time warning
- [ ] Expected clear date display
- [ ] Confirm button
- [ ] Cancel button
- [ ] Different layouts for card vs PAD

#### `FeeDisclosure.tsx` (NEW)
- [ ] Create component file
- [ ] Fee comparison table
- [ ] Real-time calculation
- [ ] Tooltip explanations
- [ ] Always visible placement
- [ ] Mobile responsive

#### `PaymentStatusBadge.tsx` (NEW)
- [ ] Create component file
- [ ] Status color coding
- [ ] Icon selection
- [ ] Tooltip with details
- [ ] Different states for PAD vs card
- [ ] Animation for processing

#### `PadMandateAgreement.tsx` (NEW)
- [ ] Create component file
- [ ] Full mandate text
- [ ] Required legal elements
- [ ] Electronic signature capture
- [ ] Date/time stamp
- [ ] Scrollable agreement
- [ ] Checkbox confirmation
- [ ] Print/download option

### Page Updates

#### `DigitalWallet.tsx` Updates
- [ ] Replace payment method selection
- [ ] Integrate `PaymentMethodSelector`
- [ ] Add PAD flow
- [ ] Update payment execution
- [ ] Add fee display
- [ ] Update payment history
- [ ] Show processing status
- [ ] Mobile responsive
- [ ] Test all flows

---

## Phase 4: Testing (Week 5)

### Unit Tests
- [ ] `feeCalculationService` tests
- [ ] Component tests (Jest/React Testing Library)
- [ ] Edge function tests
- [ ] Database query tests

### Integration Tests
- [ ] Card payment end-to-end
- [ ] PAD payment end-to-end
- [ ] Mandate creation flow
- [ ] Webhook handling
- [ ] Error scenarios

### Stripe Test Scenarios
- [ ] Successful card payment
- [ ] Declined card payment
- [ ] Successful PAD payment
- [ ] NSF PAD payment (insufficient funds)
- [ ] Invalid bank account
- [ ] Mandate revocation
- [ ] Landlord payout routing
- [ ] Multi-tenant payments

### User Acceptance Testing
- [ ] Tenant can select payment method
- [ ] Fees are clearly displayed
- [ ] PAD authorization works
- [ ] Card payment works
- [ ] Payment status updates correctly
- [ ] Landlord receives payouts
- [ ] Email notifications sent
- [ ] Mobile experience smooth

---

## Phase 5: Deployment (Week 6)

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### Deployment Steps
- [ ] Deploy database migrations
- [ ] Deploy edge functions
- [ ] Deploy frontend changes
- [ ] Verify webhook configuration
- [ ] Test in production (small transaction)
- [ ] Monitor error logs
- [ ] Monitor Stripe Dashboard

### Post-Deployment
- [ ] Smoke tests in production
- [ ] Monitor first 10 transactions
- [ ] Check webhook delivery
- [ ] Verify payout routing
- [ ] User feedback collection
- [ ] Performance monitoring

---

## Phase 6: Documentation & Training

### User Documentation
- [ ] Help article: "How to pay rent with PAD"
- [ ] Help article: "Understanding payment fees"
- [ ] Help article: "Payment processing times"
- [ ] FAQ: PAD vs Card payments
- [ ] Video tutorial: Setting up PAD
- [ ] Troubleshooting guide

### Internal Documentation
- [ ] Technical architecture document
- [ ] API integration guide
- [ ] Webhook handling guide
- [ ] Error handling procedures
- [ ] Monitoring and alerts guide
- [ ] Rollback procedures

### Training
- [ ] Customer support training
- [ ] Admin dashboard training
- [ ] Troubleshooting training
- [ ] Escalation procedures

---

## Monitoring & Maintenance

### Metrics to Track
- [ ] PAD adoption rate
- [ ] Card vs PAD usage ratio
- [ ] Payment success rate (by type)
- [ ] Average processing time
- [ ] NSF failure rate
- [ ] Fee revenue by type
- [ ] User satisfaction scores

### Alerts to Configure
- [ ] Payment failure rate > 5%
- [ ] Webhook delivery failures
- [ ] Edge function errors
- [ ] Database connection issues
- [ ] Stripe API errors
- [ ] Unusual transaction patterns

### Regular Reviews
- [ ] Weekly: Payment metrics review
- [ ] Monthly: Fee structure review
- [ ] Quarterly: User feedback analysis
- [ ] Annually: Stripe fee negotiation

---

## Critical Success Factors

### Must-Haves
✅ `payment_method_options.acss_debit` parameter in PaymentIntent  
✅ Clear fee disclosure before payment  
✅ Processing time expectations set  
✅ Mandate collection and storage  
✅ NSF error handling  
✅ Landlord payout routing  

### Nice-to-Haves
⭐ Savings calculator  
⭐ Payment method recommendations  
⭐ Auto-pay setup  
⭐ Payment reminders  
⭐ Receipt generation  
⭐ Payment history export  

---

## Risk Mitigation Checklist

- [ ] Legal review of PAD mandate
- [ ] Stripe account limits verified
- [ ] Backup payment method required
- [ ] NSF fee policy communicated
- [ ] Processing time clearly stated
- [ ] Rollback plan tested
- [ ] Customer support trained
- [ ] Monitoring alerts active

---

## Go-Live Criteria

All items must be checked before production launch:

- [ ] All tests passing (unit, integration, E2E)
- [ ] Legal approval obtained
- [ ] Stripe production account configured
- [ ] Webhooks configured and tested
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Frontend deployed
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Monitoring active
- [ ] Rollback plan ready
- [ ] Stakeholder approval

---

## Post-Launch (First 30 Days)

### Week 1
- [ ] Daily monitoring of all transactions
- [ ] Review error logs daily
- [ ] Check webhook delivery
- [ ] Monitor user feedback
- [ ] Quick bug fixes if needed

### Week 2-4
- [ ] Analyze PAD adoption rate
- [ ] Review payment success rates
- [ ] Collect user feedback
- [ ] Optimize fee structure if needed
- [ ] Performance tuning

### Month 2+
- [ ] Monthly metrics review
- [ ] User satisfaction survey
- [ ] Feature enhancement planning
- [ ] Cost optimization review

---

**Checklist Created**: February 19, 2026  
**Total Tasks**: 150+  
**Estimated Timeline**: 6 weeks  
**Priority**: CRITICAL
