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
      // Try to get the actual error body
      const errorBody = (error as any)?.context?.body;
      throw new Error(`Function error: ${errorBody || JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from payment method creation');
    }

    if (data.error) {
      throw new Error(`Stripe error: ${data.details || data.error}`);
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
 * Create a Payment Intent for any payment (independent of rent/lease)
 */
export async function createRentPaymentIntent(
  amount: number,
  paymentMethodType: PaymentMethodType,
  paymentMethodDbId: string,
  metadata?: {
    tenantId?: string;
    landlordId?: string;
    propertyId?: string;
    dueDate?: string;
  }
): Promise<{ paymentIntentId: string; clientSecret: string }> {
  try {
    console.log('🔵 createRentPaymentIntent called', {
      amount,
      paymentMethodType,
      paymentMethodDbId,
      metadata
    });

    // First, get the Stripe payment method ID from database
    const { data: paymentMethod, error: fetchError } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('id', paymentMethodDbId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching payment method:', fetchError);
      throw new Error(`Failed to fetch payment method: ${fetchError.message}`);
    }

    if (!paymentMethod?.stripe_payment_method_id) {
      throw new Error('Payment method not found or missing Stripe ID');
    }

    console.log('✅ Found Stripe payment method ID:', paymentMethod.stripe_payment_method_id);

    const fees = calculatePaymentFees(amount, paymentMethodType);
    const totalAmount = fees.total;

    const requestBody: any = {
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'cad',
      payment_method_types: [paymentMethodType === 'acss_debit' ? 'acss_debit' : 'card'],
      payment_method: paymentMethod.stripe_payment_method_id, // Use Stripe payment method ID
      metadata: {
        payment_type: 'general',
        original_amount: amount.toString(),
        transaction_fee: fees.fee.toString(),
        ...(metadata?.tenantId && { tenant_id: metadata.tenantId }),
        ...(metadata?.landlordId && { landlord_id: metadata.landlordId }),
        ...(metadata?.propertyId && { property_id: metadata.propertyId }),
        ...(metadata?.dueDate && { due_date: metadata.dueDate })
      }
    };

    // Add PAD-specific options
    if (paymentMethodType === 'acss_debit') {
      requestBody.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Payment',
            transaction_type: 'personal'
          },
          verification_method: 'instant'
        }
      };
    }

    console.log('🔄 Invoking create-pad-payment-intent Edge Function...', requestBody);

    const { data, error } = await supabase.functions.invoke('create-pad-payment-intent', {
      body: requestBody
    });

    console.log('📊 Edge Function response:', { data, error });

    if (error) {
      console.error('❌ Edge Function error:', error);
      throw new Error(`Edge Function error: ${JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from payment intent creation');
    }

    if (!data.id || !data.client_secret) {
      console.error('❌ Invalid response data:', data);
      throw new Error(`Invalid response from Edge Function: ${JSON.stringify(data)}`);
    }

    console.log('✅ Payment intent created successfully:', data.id);

    return {
      paymentIntentId: data.id,
      clientSecret: data.client_secret
    };
  } catch (error: any) {
    console.error('❌ Error creating payment intent:', error);
    throw new Error(error.message || 'Failed to create payment intent');
  }
}

/**
 * Record payment in database (optional - only if you want to track in rental_payments table)
 */
export async function recordRentPayment(
  paymentData: {
    amount: number;
    paymentMethodType: PaymentMethodType;
    paymentMethodId: string;
    stripePaymentIntentId: string;
    propertyId?: string;
    tenantId?: string;
    landlordId?: string;
    dueDate?: string;
    stripeMandateId?: string;
  }
): Promise<string> {
  try {
    const fees = calculatePaymentFees(paymentData.amount, paymentData.paymentMethodType);
    const processingDays = paymentData.paymentMethodType === 'acss_debit' ? 5 : 0;
    const expectedClearDate = paymentData.paymentMethodType === 'acss_debit'
      ? calculateExpectedClearDate(processingDays)
      : null;

    // Build insert object with only provided fields
    const insertData: any = {
      amount: paymentData.amount,
      currency: 'CAD',
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
      transaction_id: paymentData.stripePaymentIntentId,
      description: `Payment of ${fees.total} CAD`,
      payment_type: 'first_month_rent',
      payment_method: paymentData.paymentMethodType === 'acss_debit' ? 'bank_transfer' : 'credit_card'
    };

    // Add optional fields only if provided
    if (paymentData.propertyId) insertData.property_id = paymentData.propertyId;
    if (paymentData.tenantId) insertData.tenant_id = paymentData.tenantId;
    if (paymentData.landlordId) insertData.landlord_id = paymentData.landlordId;
    if (paymentData.dueDate) insertData.due_date = paymentData.dueDate;

    const { data, error } = await supabase
      .from('rental_payments')
      .insert(insertData as any)
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
