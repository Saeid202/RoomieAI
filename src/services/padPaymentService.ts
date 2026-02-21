import { supabase } from '@/integrations/supabase/client';
import {
  PaymentMethodType,
  BankAccountDetails,
  PadPaymentIntent,
  CardPaymentIntent,
  PaymentMethod,
  MandateDetails
} from '@/types/payment';
import { calculatePaymentFees, calculateExpectedClearDate } from './feeCalculationService';

/**
 * Create a Stripe Payment Method for Canadian PAD
 */
export async function createPadPaymentMethod(
  bankDetails: BankAccountDetails
): Promise<{ paymentMethodId: string; mandateId: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-pad-payment-method', {
      body: {
        accountHolderName: bankDetails.accountHolderName,
        institutionNumber: bankDetails.institutionNumber,
        transitNumber: bankDetails.transitNumber,
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from payment method creation');
    }

    if (!data.paymentMethodId || !data.setupIntentId) {
      console.error('Invalid response data:', data);
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    // For now, we'll use the setupIntentId as the mandateId
    // In production, you'd need to confirm the SetupIntent with Stripe.js
    // and then retrieve the actual mandate ID
    return {
      paymentMethodId: data.paymentMethodId,
      mandateId: data.setupIntentId // Temporary: using setupIntentId as placeholder
    };
  } catch (error: any) {
    console.error('Error creating PAD payment method:', error);
    // Include more details in the error message
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    throw new Error(`Failed to create payment method: ${errorMessage}`);
  }
}

/**
 * Save payment method to database
 */
export async function savePaymentMethod(
  userId: string,
  paymentMethodType: PaymentMethodType,
  stripePaymentMethodId: string,
  details: {
    mandateId?: string;
    mandateStatus?: string;
    bankName?: string;
    transitNumber?: string;
    institutionNumber?: string;
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
  }
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        payment_type: paymentMethodType,
        stripe_payment_method_id: stripePaymentMethodId,
        mandate_id: details.mandateId,
        mandate_status: details.mandateStatus || 'active',
        mandate_accepted_at: new Date().toISOString(),
        bank_name: details.bankName,
        transit_number: details.transitNumber,
        institution_number: details.institutionNumber,
        last4: details.last4,
        brand: details.brand,
        exp_month: details.expMonth,
        exp_year: details.expYear,
        is_default: true // Set as default
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
}

/**
 * Create a Payment Intent for rent payment
 */
export async function createRentPaymentIntent(
  amount: number,
  paymentMethodType: PaymentMethodType,
  paymentMethodId: string,
  metadata: {
    tenantId: string;
    landlordId: string;
    propertyId: string;
    dueDate: string;
  }
): Promise<{ paymentIntentId: string; clientSecret: string }> {
  try {
    const fees = calculatePaymentFees(amount, paymentMethodType);
    const totalAmount = fees.total;

    const requestBody: any = {
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'cad',
      payment_method_types: [paymentMethodType === 'acss_debit' ? 'acss_debit' : 'card'],
      payment_method: paymentMethodId,
      metadata: {
        tenant_id: metadata.tenantId,
        landlord_id: metadata.landlordId,
        property_id: metadata.propertyId,
        due_date: metadata.dueDate,
        payment_type: 'rent',
        original_amount: amount.toString(),
        transaction_fee: fees.fee.toString()
      }
    };

    // Add PAD-specific options
    if (paymentMethodType === 'acss_debit') {
      requestBody.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly rent payment',
            transaction_type: 'personal'
          },
          verification_method: 'instant'
        }
      };
    }

    const { data, error } = await supabase.functions.invoke('create-pad-payment-intent', {
      body: requestBody
    });

    if (error) throw error;
    if (!data) throw new Error('No data returned from payment intent creation');

    return {
      paymentIntentId: data.id,
      clientSecret: data.client_secret
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Record rent payment in database
 */
export async function recordRentPayment(
  paymentData: {
    propertyId: string;
    tenantId: string;
    landlordId: string;
    amount: number;
    dueDate: string;
    paymentMethodType: PaymentMethodType;
    paymentMethodId: string;
    stripePaymentIntentId: string;
    stripeMandateId?: string;
  }
): Promise<string> {
  try {
    const fees = calculatePaymentFees(paymentData.amount, paymentData.paymentMethodType);
    const processingDays = paymentData.paymentMethodType === 'acss_debit' ? 5 : 0;
    const expectedClearDate = paymentData.paymentMethodType === 'acss_debit'
      ? calculateExpectedClearDate(processingDays)
      : null;

    // Note: TypeScript types may not be updated yet after migration
    // Casting to any to use new columns added by migration
    const { data, error } = await supabase
      .from('rental_payments')
      .insert({
        property_id: paymentData.propertyId,
        tenant_id: paymentData.tenantId,
        landlord_id: paymentData.landlordId,
        amount: paymentData.amount,
        currency: 'CAD',
        due_date: paymentData.dueDate,
        status: 'initiated',
        payment_method_id: paymentData.paymentMethodId,
        payment_method_type: paymentData.paymentMethodType,
        transaction_fee: fees.fee,
        processing_days: processingDays,
        expected_clear_date: expectedClearDate,
        stripe_payment_intent_id: paymentData.stripePaymentIntentId,
        stripe_mandate_id: paymentData.stripeMandateId,
        payment_metadata: {
          fee_breakdown: {
            original_amount: paymentData.amount,
            transaction_fee: fees.fee,
            total: fees.total
          },
          payment_method: paymentData.paymentMethodType,
          initiated_at: new Date().toISOString()
        },
        // Required fields from existing schema
        transaction_id: paymentData.stripePaymentIntentId,
        application_id: null, // Optional for rent payments
        description: `Rent payment for ${paymentData.dueDate}`,
        payment_type: 'first_month_rent', // Using existing enum value
        payment_method: paymentData.paymentMethodType === 'acss_debit' ? 'bank_transfer' : 'credit_card'
      } as any) // Cast to any since TypeScript types not regenerated yet
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error recording rent payment:', error);
    throw error;
  }
}

/**
 * Get user's saved payment methods
 */
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Cast to PaymentMethod[] since TypeScript types may not be updated yet
    return (data || []) as unknown as PaymentMethod[];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

/**
 * Set payment method as default
 */
export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    // First, unset all as default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the selected one as default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
}
