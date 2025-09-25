import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  property_id: string;
  application_id: string;
  tenant_id: string;
  landlord_id: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'bank_transfer';
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
  billing_address?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transaction_id?: string;
  error_message?: string;
  amount_paid: number;
  payment_date: string;
}

/**
 * Process payment for rental application
 * This is a mock implementation - in production you'd integrate with Stripe, PayPal, etc.
 */
export async function processRentalPayment(
  paymentData: PaymentData,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> {
  console.log("Processing rental payment:", paymentData);
  
  try {
    // Mock payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment validation
    if (!paymentMethod.cardholder_name || paymentMethod.cardholder_name.length < 2) {
      throw new Error("Invalid cardholder name");
    }
    
    if (!paymentMethod.card_number || paymentMethod.card_number.length < 15) {
      throw new Error("Invalid card number");
    }
    
    if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
      throw new Error("Invalid CVV");
    }
    
    // Mock successful payment
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // In production, you would:
    // 1. Validate payment details with payment processor
    // 2. Charge the card/process bank transfer
    // 3. Store payment record in database
    // 4. Send confirmation emails
    
    // Store payment record in database
    const paymentRecord = {
      transaction_id: transactionId,
      property_id: paymentData.property_id,
      application_id: paymentData.application_id,
      tenant_id: paymentData.tenant_id,
      landlord_id: paymentData.landlord_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      payment_method: paymentMethod.type,
      payment_status: 'completed',
      payment_date: new Date().toISOString(),
      billing_address: paymentMethod.billing_address
    };
    
    // Mock database insert (in production, uncomment this)
    /*
    const { data, error } = await sb
      .from('rental_payments')
      .insert(paymentRecord)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
    */
    
    console.log("Payment processed successfully:", transactionId);
    
    return {
      success: true,
      transaction_id: transactionId,
      amount_paid: paymentData.amount,
      payment_date: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      error_message: error instanceof Error ? error.message : "Payment processing failed",
      amount_paid: 0,
      payment_date: new Date().toISOString()
    };
  }
}

/**
 * Calculate total amount due for rental application
 */
export function calculateRentalPaymentAmount(monthlyRent: number, securityDeposit?: number): {
  monthlyRent: number;
  securityDeposit: number;
  total: number;
  breakdown: string;
} {
  const deposit = securityDeposit || monthlyRent; // Default to 1 month rent if not specified
  const total = monthlyRent + deposit;
  
  return {
    monthlyRent,
    securityDeposit: deposit,
    total,
    breakdown: `First month rent ($${monthlyRent.toLocaleString()}) + Security deposit ($${deposit.toLocaleString()})`
  };
}

/**
 * Validate credit card number (basic Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): boolean {
  const num = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(num)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Format credit card number with spaces
 */
export function formatCreditCardNumber(value: string): string {
  const num = value.replace(/\s/g, '');
  const match = num.match(/\d{1,4}/g);
  return match ? match.join(' ').substr(0, 19) : '';
}

/**
 * Get credit card type from number
 */
export function getCreditCardType(cardNumber: string): string {
  const num = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6/.test(num)) return 'Discover';
  
  return 'Unknown';
}
