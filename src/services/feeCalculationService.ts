/**
 * Fee Calculation Service
 * Phase 1: Calculate transaction fees for different payment methods
 * 
 * Fee Structure:
 * - Card (Credit/Debit): 2.9% + $0.30 CAD
 * - PAD (ACSS Debit): 1% + $0.25 CAD
 */

export interface PaymentFee {
  fee: number;
  total: number;
  percentage: string;
  fixed: string;
  processingTime: string;
  savings?: number;
}

export type PaymentMethodType = 'card' | 'acss_debit' | 'bank_account';

/**
 * Calculate fee for card payments (credit or debit)
 * @param amount - Payment amount in CAD
 * @returns PaymentFee object with fee details
 */
export const calculateCardFee = (amount: number): PaymentFee => {
  const percentageFee = amount * 0.029; // 2.9%
  const fixedFee = 0.30; // $0.30 CAD
  const totalFee = percentageFee + fixedFee;
  
  return {
    fee: parseFloat(totalFee.toFixed(2)),
    total: parseFloat((amount + totalFee).toFixed(2)),
    percentage: '2.9%',
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
  const percentageFee = amount * 0.01; // 1%
  const fixedFee = 0.25; // $0.25 CAD
  const totalFee = percentageFee + fixedFee;
  
  // Calculate savings compared to card
  const cardFee = (amount * 0.029) + 0.30;
  const savings = cardFee - totalFee;
  
  return {
    fee: parseFloat(totalFee.toFixed(2)),
    total: parseFloat((amount + totalFee).toFixed(2)),
    percentage: '1%',
    fixed: '$0.25',
    processingTime: '3-5 business days',
    savings: parseFloat(savings.toFixed(2))
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
  
  return {
    card: cardFee,
    pad: padFee,
    savings: padFee.savings || 0,
    savingsPercentage: ((padFee.savings || 0) / cardFee.fee * 100).toFixed(1)
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
