/**
 * Fee Calculation Service Tests
 * Phase 1: Unit tests for fee calculation functions
 */

import {
  calculateCardFee,
  calculatePadFee,
  calculatePaymentFees,
  calculateExpectedClearDate,
  formatCurrency,
  calculatePlatformRevenue,
  getFeeComparison,
  validatePaymentAmount
} from './feeCalculationService';

describe('feeCalculationService', () => {
  describe('calculateCardFee', () => {
    it('should calculate correct fee for $2000 rent', () => {
      const result = calculateCardFee(2000);
      
      expect(result.fee).toBe(58.30); // (2000 * 0.029) + 0.30
      expect(result.total).toBe(2058.30);
      expect(result.percentage).toBe('2.9%');
      expect(result.fixed).toBe('$0.30');
      expect(result.processingTime).toBe('Instant');
    });

    it('should calculate correct fee for $1500 rent', () => {
      const result = calculateCardFee(1500);
      
      expect(result.fee).toBe(43.80); // (1500 * 0.029) + 0.30
      expect(result.total).toBe(1543.80);
    });

    it('should handle small amounts', () => {
      const result = calculateCardFee(10);
      
      expect(result.fee).toBe(0.59); // (10 * 0.029) + 0.30
      expect(result.total).toBe(10.59);
    });

    it('should handle large amounts', () => {
      const result = calculateCardFee(10000);
      
      expect(result.fee).toBe(290.30); // (10000 * 0.029) + 0.30
      expect(result.total).toBe(10290.30);
    });
  });

  describe('calculatePadFee', () => {
    it('should calculate correct fee for $2000 rent', () => {
      const result = calculatePadFee(2000);
      
      expect(result.fee).toBe(20.25); // (2000 * 0.01) + 0.25
      expect(result.total).toBe(2020.25);
      expect(result.percentage).toBe('1%');
      expect(result.fixed).toBe('$0.25');
      expect(result.processingTime).toBe('3-5 business days');
      expect(result.savings).toBe(38.05); // 58.30 - 20.25
    });

    it('should calculate correct fee for $1500 rent', () => {
      const result = calculatePadFee(1500);
      
      expect(result.fee).toBe(15.25); // (1500 * 0.01) + 0.25
      expect(result.total).toBe(1515.25);
      expect(result.savings).toBe(28.55); // 43.80 - 15.25
    });

    it('should show savings compared to card', () => {
      const result = calculatePadFee(2000);
      
      expect(result.savings).toBeGreaterThan(0);
      expect(result.savings).toBe(38.05);
    });
  });

  describe('calculatePaymentFees', () => {
    it('should return card fees when type is card', () => {
      const result = calculatePaymentFees(2000, 'card');
      
      expect(result.fee).toBe(58.30);
      expect(result.processingTime).toBe('Instant');
    });

    it('should return PAD fees when type is acss_debit', () => {
      const result = calculatePaymentFees(2000, 'acss_debit');
      
      expect(result.fee).toBe(20.25);
      expect(result.processingTime).toBe('3-5 business days');
      expect(result.savings).toBe(38.05);
    });
  });

  describe('calculateExpectedClearDate', () => {
    it('should add 5 business days by default', () => {
      const today = new Date();
      const result = calculateExpectedClearDate();
      
      // Result should be at least 5 days in the future
      const daysDiff = Math.floor((result.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(5);
    });

    it('should skip weekends', () => {
      const result = calculateExpectedClearDate(5);
      
      // Verify it's a weekday (Monday = 1, Friday = 5)
      const dayOfWeek = result.getDay();
      expect(dayOfWeek).toBeGreaterThanOrEqual(1);
      expect(dayOfWeek).toBeLessThanOrEqual(5);
    });

    it('should handle custom number of days', () => {
      const result = calculateExpectedClearDate(3);
      const today = new Date();
      
      const daysDiff = Math.floor((result.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(3);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(2000)).toBe('$2,000.00');
      expect(formatCurrency(1500.50)).toBe('$1,500.50');
      expect(formatCurrency(10)).toBe('$10.00');
    });

    it('should handle decimals', () => {
      expect(formatCurrency(2058.30)).toBe('$2,058.30');
      expect(formatCurrency(20.25)).toBe('$20.25');
    });
  });

  describe('calculatePlatformRevenue', () => {
    it('should return 0 for card payments (pass-through)', () => {
      const revenue = calculatePlatformRevenue(2000, 'card');
      expect(revenue).toBe(0);
    });

    it('should calculate revenue for PAD payments', () => {
      const revenue = calculatePlatformRevenue(2000, 'acss_debit');
      
      // We charge 1% + $0.25 = $20.25
      // Stripe charges ~0.25% = ~$5.00
      // Revenue = ~$15.25
      expect(revenue).toBeGreaterThan(0);
      expect(revenue).toBeCloseTo(15.25, 1);
    });
  });

  describe('getFeeComparison', () => {
    it('should return comparison for $2000', () => {
      const comparison = getFeeComparison(2000);
      
      expect(comparison.card.fee).toBe(58.30);
      expect(comparison.pad.fee).toBe(20.25);
      expect(comparison.savings).toBe(38.05);
      expect(comparison.savingsPercentage).toBe('65.3'); // (38.05 / 58.30 * 100)
    });

    it('should show PAD is cheaper', () => {
      const comparison = getFeeComparison(1500);
      
      expect(comparison.pad.fee).toBeLessThan(comparison.card.fee);
      expect(comparison.savings).toBeGreaterThan(0);
    });
  });

  describe('validatePaymentAmount', () => {
    it('should accept valid amounts', () => {
      expect(validatePaymentAmount(2000).isValid).toBe(true);
      expect(validatePaymentAmount(1500).isValid).toBe(true);
      expect(validatePaymentAmount(1).isValid).toBe(true);
    });

    it('should reject zero or negative amounts', () => {
      expect(validatePaymentAmount(0).isValid).toBe(false);
      expect(validatePaymentAmount(-100).isValid).toBe(false);
    });

    it('should reject amounts below minimum', () => {
      const result = validatePaymentAmount(0.50);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum payment amount');
    });

    it('should reject amounts above maximum', () => {
      const result = validatePaymentAmount(150000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maximum payment amount');
    });

    it('should reject NaN', () => {
      const result = validatePaymentAmount(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });
  });
});
