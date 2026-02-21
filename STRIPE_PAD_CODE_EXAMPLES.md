# Stripe PAD Integration - Critical Code Examples

## 1. Creating PaymentIntent with ACSS Debit (CRITICAL)

This is the MOST IMPORTANT code change Stripe mentioned.

### Edge Function: `execute-pad-payment/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { rent_ledger_id, payment_method_id } = await req.json();

    // Get rent details
    const { data: ledger } = await supabase
      .from('rent_ledgers')
      .select('*, property:properties(landlord_id)')
      .eq('id', rent_ledger_id)
      .single();

    // Get landlord's Stripe Connect account
    const { data: landlordAccount } = await supabase
      .from('payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', ledger.property.landlord_id)
      .eq('account_type', 'landlord')
      .single();

    // Calculate fees
    const rentAmount = ledger.rent_amount;
    const transactionFee = (rentAmount * 0.01) + 0.25; // 1% + $0.25
    const totalAmount = rentAmount + transactionFee;

    // CRITICAL: Create PaymentIntent with acss_debit options
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'cad',
      payment_method_types: ['acss_debit'],
      payment_method: payment_method_id,
      customer: customerId,
      
      // ⚠️ THIS IS THE CRITICAL PARAMETER STRIPE MENTIONED ⚠️
      payment_method_options: {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly rent payment',
            transaction_type: 'personal' // or 'business'
          },
          verification_method: 'instant' // or 'microdeposits'
        }
      },
      
      // Route funds to landlord's Connect account
      transfer_data: {
        destination: landlordAccount.stripe_account_id,
        amount: Math.round(rentAmount * 100) // Landlord gets rent, platform keeps fee
      },
      
      metadata: {
        rent_ledger_id: rent_ledger_id,
        tenant_id: ledger.tenant_id,
        landlord_id: ledger.property.landlord_id,
        payment_type: 'acss_debit',
        rent_amount: rentAmount.toString(),
        transaction_fee: transactionFee.toString()
      }
    });

    // Save payment record
    await supabase.from('rent_payments').insert({
      rent_ledger_id: rent_ledger_id,
      tenant_id: ledger.tenant_id,
      landlord_id: ledger.property.landlord_id,
      amount: rentAmount,
      transaction_fee: transactionFee,
      payment_method_type: 'acss_debit',
      status: 'processing',
      stripe_payment_intent_id: paymentIntent.id,
      expected_clear_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    });

    return new Response(JSON.stringify({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      expected_clear_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error('PAD Payment Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

---

## 2. Creating ACSS Debit Payment Method

### Edge Function: `manage-financial-connections/index.ts`

```typescript
// After bank account is connected via Financial Connections

if (action === "create-acss-payment-method") {
  const { financial_connections_account_id } = await req.json();

  // Create ACSS Debit payment method
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'acss_debit',
    acss_debit: {
      financial_connections_account: financial_connections_account_id
    },
    billing_details: {
      name: user.user_metadata.full_name,
      email: user.email
    }
  });

  // Attach to customer
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customerId
  });

  // Create mandate for recurring payments
  const mandate = await stripe.mandates.create({
    payment_method: paymentMethod.id,
    customer: customerId
  });

  // Save to database
  await supabase.from('payment_methods').insert({
    user_id: user.id,
    stripe_payment_method_id: paymentMethod.id,
    payment_type: 'acss_debit',
    card_type: 'bank_account',
    brand: 'Canadian Bank',
    last4: paymentMethod.acss_debit.last4,
    bank_name: paymentMethod.acss_debit.bank_name,
    mandate_id: mandate.id,
    mandate_status: mandate.status,
    mandate_accepted_at: new Date().toISOString(),
    is_default: false
  });

  return new Response(JSON.stringify({
    payment_method_id: paymentMethod.id,
    mandate_id: mandate.id,
    last4: paymentMethod.acss_debit.last4,
    bank_name: paymentMethod.acss_debit.bank_name
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

---

## 3. Frontend: Payment Method Selection

### Component: `PaymentMethodSelector.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, TrendingDown, Clock, Zap } from 'lucide-react';

interface PaymentMethodSelectorProps {
  rentAmount: number;
  onSelect: (type: 'card' | 'acss_debit') => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  rentAmount,
  onSelect
}) => {
  const [selectedType, setSelectedType] = useState<'card' | 'acss_debit'>('acss_debit');

  // Calculate fees
  const cardFee = (rentAmount * 0.029) + 0.30;
  const padFee = (rentAmount * 0.01) + 0.25;
  const savings = cardFee - padFee;

  const cardTotal = rentAmount + cardFee;
  const padTotal = rentAmount + padFee;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Payment Method</h3>
      
      {/* PAD Option - Recommended */}
      <Card
        className={`p-4 cursor-pointer transition-all ${
          selectedType === 'acss_debit'
            ? 'border-2 border-green-500 bg-green-50'
            : 'border hover:border-gray-400'
        }`}
        onClick={() => setSelectedType('acss_debit')}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-base">Canadian Bank Account (PAD)</h4>
                <Badge className="bg-green-600 text-white text-xs">
                  ⭐ Recommended
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">Lowest Fee: 1% + $0.25 CAD</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Processing: 3-5 business days</span>
                </div>
                
                <div className="bg-white rounded p-2 border border-green-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Rent Amount:</span>
                    <span className="font-medium">${rentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Transaction Fee:</span>
                    <span className="font-medium text-green-600">${padFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>${padTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-green-100 rounded p-2 text-xs text-green-800">
                  💰 Save ${savings.toFixed(2)} per month compared to card payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card Option */}
      <Card
        className={`p-4 cursor-pointer transition-all ${
          selectedType === 'card'
            ? 'border-2 border-blue-500 bg-blue-50'
            : 'border hover:border-gray-400'
        }`}
        onClick={() => setSelectedType('card')}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base mb-1">Credit or Debit Card</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Instant Processing</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Fee: 2.9% + $0.30 CAD</span>
                </div>
                
                <div className="bg-white rounded p-2 border border-blue-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Rent Amount:</span>
                    <span className="font-medium">${rentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Transaction Fee:</span>
                    <span className="font-medium text-orange-600">${cardFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>${cardTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button
        onClick={() => onSelect(selectedType)}
        className="w-full"
        size="lg"
      >
        Continue with {selectedType === 'acss_debit' ? 'Bank Account' : 'Card'}
      </Button>
    </div>
  );
};
```

---

## 4. Frontend: PAD Payment Confirmation

### Component: `PadPaymentCheckout.tsx`

```typescript
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PadPaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rentAmount: number;
  bankName: string;
  last4: string;
  expectedClearDate: Date;
}

export const PadPaymentCheckout: React.FC<PadPaymentCheckoutProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rentAmount,
  bankName,
  last4,
  expectedClearDate
}) => {
  const transactionFee = (rentAmount * 0.01) + 0.25;
  const total = rentAmount + transactionFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Rent Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Method */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building2 className="h-5 w-5 text-gray-600" />
            <div>
              <div className="text-sm font-medium">{bankName}</div>
              <div className="text-xs text-gray-500">Account ****{last4}</div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rent Amount</span>
              <span className="font-medium">${rentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction Fee (1% + $0.25)</span>
              <span className="font-medium text-green-600">${transactionFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">${total.toFixed(2)} CAD</span>
            </div>
          </div>

          {/* Processing Time Warning */}
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <div className="font-medium mb-1">Processing Time: 3-5 business days</div>
              <div className="text-xs">
                Expected clear date: {expectedClearDate.toLocaleDateString('en-CA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </AlertDescription>
          </Alert>

          {/* NSF Warning */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              Please ensure sufficient funds are available in your account. NSF fees may apply if payment fails.
            </AlertDescription>
          </Alert>

          {/* Confirmation Checklist */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>I authorize this Pre-Authorized Debit payment</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>I understand payment will take 3-5 business days to process</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>I have sufficient funds in my account</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 5. Webhook Handler for PAD Status Updates

### Edge Function: `payment-webhook/index.ts`

```typescript
serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Handle PAD payment success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    if (paymentIntent.payment_method_types.includes('acss_debit')) {
      await supabase
        .from('rent_payments')
        .update({
          status: 'succeeded',
          payment_cleared_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      // Send notification to tenant and landlord
      // ... notification logic
    }
  }

  // Handle PAD payment failure (NSF)
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const failureReason = paymentIntent.last_payment_error?.code;
    
    if (paymentIntent.payment_method_types.includes('acss_debit')) {
      await supabase
        .from('rent_payments')
        .update({
          status: 'failed',
          failure_reason: failureReason,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      // Send NSF notification
      if (failureReason === 'insufficient_funds') {
        // ... NSF notification logic
      }
    }
  }

  // Handle mandate updates
  if (event.type === 'mandate.updated') {
    const mandate = event.data.object;
    
    await supabase
      .from('payment_methods')
      .update({
        mandate_status: mandate.status,
        updated_at: new Date().toISOString()
      })
      .eq('mandate_id', mandate.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

---

## 6. Fee Calculation Service

### Service: `feeCalculationService.ts`

```typescript
export interface PaymentFee {
  fee: number;
  total: number;
  percentage: string;
  fixed: string;
  processingTime: string;
  savings?: number;
}

export const calculatePaymentFees = (
  rentAmount: number,
  paymentType: 'card' | 'acss_debit'
): PaymentFee => {
  if (paymentType === 'card') {
    const fee = (rentAmount * 0.029) + 0.30;
    return {
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat((rentAmount + fee).toFixed(2)),
      percentage: '2.9%',
      fixed: '$0.30',
      processingTime: 'Instant'
    };
  } else {
    const fee = (rentAmount * 0.01) + 0.25;
    const cardFee = (rentAmount * 0.029) + 0.30;
    const savings = cardFee - fee;
    
    return {
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat((rentAmount + fee).toFixed(2)),
      percentage: '1%',
      fixed: '$0.25',
      processingTime: '3-5 business days',
      savings: parseFloat(savings.toFixed(2))
    };
  }
};

export const calculateExpectedClearDate = (daysToAdd: number = 5): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date;
};
```

---

## Key Takeaways

### Critical Stripe Parameter
```typescript
payment_method_options: {
  acss_debit: {
    mandate_options: {
      payment_schedule: 'interval',
      interval_description: 'Monthly rent payment',
      transaction_type: 'personal'
    },
    verification_method: 'instant'
  }
}
```

### Fee Structure
- **Card**: 2.9% + $0.30 CAD
- **PAD**: 1% + $0.25 CAD
- **Savings**: ~$38 per $2,000 rent payment

### Processing Times
- **Card**: Instant
- **PAD**: 3-5 business days

---

**Code Examples Created**: February 19, 2026  
**Status**: Ready for implementation  
**Priority**: CRITICAL - Stripe requirement
