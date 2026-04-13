/**
 * Fee Calculation Service
 * Phase 1: Calculate transaction fees for different payment methods
 * 
 * Fee Structure:
 * - Card (Affirm BNPL): 6% + $0.30 CAD
 * - PAD (ACSS Debit): 1% + $0.40 CAD (capped at $5.00)
 */

export interface PaymentFee {
  fee: number;
  total: number;
  percentage: number | string;
  fixed: string;
  processingTime: string;
  savings?: number;
  description?: string;
}

export type PaymentMethodType = 'card' | 'acss_debit' | 'bank_account';

/**
 * Calculate fee for card payments (credit or debit)
 * @param amount - Payment amount in CAD
 * @returns PaymentFee object with fee details
 */
export const calculateCardFee = (amount: number): PaymentFee => {
  const percentageFee = amount * 0.06; // 6% for Affirm
  const fixedFee = 0.30; // $0.30 CAD
  const totalFee = percentageFee + fixedFee;
  
  return {
    fee: parseFloat(totalFee.toFixed(2)),
    total: parseFloat((amount + totalFee).toFixed(2)),
    percentage: 6.0,
    fixed: '$0.30',
    processingTime: 'Instant'
  };
};

/**
 * Calculate fee for PAD (Pre-Authorized Debit) payments
 * @param amount - Payment amount in CAD
 * @returns PaymentFee object with fee details and savings
 */
export const calculatePadFee = (amount: number): PaymentFee => {
  // PAD: 1% + $0.40 for amounts <= $460, flat $5.00 for amounts > $460
  let fee: number;
  let percentage: number;
  
  if (amount <= 460) {
    // For amounts <= $460: 1% + $0.40
    fee = (amount * 0.01) + 0.40;
    percentage = 1.0;
  } else {
    // For amounts > $460: flat $5.00
    fee = 5.00;
    percentage = 1.0; // Keep consistent 1% display
  }
  
  return {
    fee,
    total: amount + fee,
    percentage,
    fixed: '$0.40',
    processingTime: '3-5 business days',
    description: 'Low fees for bank transfers'
  };
};

/**
 * Calculate payment fees based on payment method type
 * @param amount - Payment amount in CAD
 * @param paymentType - Type of payment method ('card' or 'acss_debit')
 * @returns PaymentFee object with fee details
 */
export const calculatePaymentFees = (
  amount: number,
  paymentType: PaymentMethodType
): PaymentFee => {
  if (paymentType === 'card') {
    return calculateCardFee(amount);
  } else {
    return calculatePadFee(amount);
  }
};

/**
 * Calculate expected clear date for PAD payments
 * @param daysToAdd - Number of business days to add (default: 5)
 * @returns Date object representing expected clear date
 */
export const calculateExpectedClearDate = (daysToAdd: number = 5): Date => {
  const date = new Date();
  let addedDays = 0;
  
  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return date;
};

/**
 * Format currency amount for display
 * @param amount - Amount in CAD
 * @returns Formatted string (e.g., "$2,000.00")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate platform revenue from transaction fee
 * Platform keeps the difference between charged fee and Stripe's actual fee
 * 
 * @param amount - Payment amount in CAD
 * @param paymentType - Type of payment method
 * @returns Platform revenue amount
 */
export const calculatePlatformRevenue = (
  amount: number,
  paymentType: PaymentMethodType
): number => {
  if (paymentType === 'card') {
    // Card: We charge 2.9% + $0.30, Stripe charges same
    // Platform revenue: $0 (pass-through)
    return 0;
  } else {
    // PAD: We charge 1% + $0.25, Stripe charges ~0.25%
    const chargedFee = (amount * 0.01) + 0.25;
    const stripeFee = (amount * 0.0025); // Approximate Stripe PAD fee
    const revenue = chargedFee - stripeFee;
    return parseFloat(revenue.toFixed(2));
  }
};

/**
 * Get fee comparison between card and PAD
 * @param amount - Payment amount in CAD
 * @returns Object with card fee, PAD fee, and savings
 */
export const getFeeComparison = (amount: number) => {
  const cardFee = calculateCardFee(amount);
  const padFee = calculatePadFee(amount);
  
  // Debug logging
  console.log('getFeeComparison - Amount:', amount);
  console.log('getFeeComparison - Card Fee:', cardFee.fee);
  console.log('getFeeComparison - PAD Fee:', padFee.fee);
  
  // Calculate savings: card fee - PAD fee
  const savings = cardFee.fee - padFee.fee;
  const savingsPercentage = savings > 0 ? (savings / cardFee.fee * 100).toFixed(1) : '0.0';
  
  return {
    card: cardFee,
    pad: padFee,
    savings: savings > 0 ? savings : 0,
    savingsPercentage
  };
};

/**
 * Validate payment amount
 * @param amount - Payment amount to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePaymentAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than zero' };
  }
  
  if (amount < 1) {
    return { isValid: false, error: 'Minimum payment amount is $1.00 CAD' };
  }
  
  if (amount > 100000) {
    return { isValid: false, error: 'Maximum payment amount is $100,000.00 CAD' };
  }
  
  return { isValid: true };
};
