import { supabase } from '@/integrations/supabase/client';
import { StripeAPIService } from './stripeAPIService';
import { STRIPE_CONFIG } from '@/config/stripe';
import {
  PaymentAccount,
  PaymentMethod,
  RentPayment,
  PaymentTransaction,
  PaymentResult,
  RefundResult,
  PayoutResult,
  RentCollection,
  PaymentAnalytics,
  FinancialReport,
  PaymentMethodData,
  RentPaymentData,
  PaymentDashboardData,
  RentCollectionDashboardData
} from '@/types/payment';

export class PaymentService {
  // Account Management
  static async createPaymentAccount(userId: string, type: 'tenant' | 'landlord'): Promise<PaymentAccount> {
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .insert({
          user_id: userId,
          account_type: type,
          balance: 0.00,
          currency: 'CAD',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentAccount;
    } catch (error) {
      console.error('Error creating payment account:', error);
      throw new Error('Failed to create payment account');
    }
  }

  static async getPaymentAccount(userId: string, type?: 'tenant' | 'landlord'): Promise<PaymentAccount | null> {
    try {
      let query = supabase
        .from('payment_accounts')
        .select('*')
        .eq('user_id', userId);

      if (type) {
        query = query.eq('account_type', type);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PaymentAccount | null;
    } catch (error) {
      console.error('Error getting payment account:', error);
      throw new Error('Failed to get payment account');
    }
  }

  // Payment Methods
  static async addPaymentMethod(userId: string, methodData: PaymentMethodData): Promise<PaymentMethod> {
    try {
      // Get or create Stripe customer
      let customerId = await this.getStripeCustomerId(userId);
      if (!customerId) {
        const customer = await StripeAPIService.createCustomer(
          methodData.metadata?.email || '',
          methodData.metadata?.name,
          { user_id: userId }
        );
        customerId = customer.id;
      }

      // Attach payment method to customer
      const paymentMethod = await StripeAPIService.attachPaymentMethod(
        methodData.providerId,
        customerId
      );

      // Save to database
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          method_type: methodData.methodType,
          provider: methodData.provider,
          provider_id: methodData.providerId,
          metadata: {
            ...methodData.metadata,
            stripe_customer_id: customerId,
            stripe_payment_method_id: paymentMethod.id,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            exp_month: paymentMethod.card?.exp_month,
            exp_year: paymentMethod.card?.exp_year
          },
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Failed to add payment method');
    }
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentMethod[];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  static async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    try {
      // First, unset all default methods for this user
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  static async removePaymentMethod(methodId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Failed to remove payment method');
    }
  }

  // Payment Processing
  static async processRentPayment(paymentData: RentPaymentData): Promise<PaymentResult> {
    try {
      // Create rent payment record
      const { data: rentPayment, error: rentError } = await supabase
        .from('rent_payments')
        .insert({
          property_id: paymentData.propertyId,
          tenant_id: paymentData.tenantId,
          landlord_id: paymentData.landlordId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'CAD',
          due_date: paymentData.dueDate,
          payment_method_id: paymentData.paymentMethodId,
          platform_fee: this.calculatePlatformFee(paymentData.amount)
        })
        .select()
        .single();

      if (rentError) throw rentError;

      // Get payment method and customer info
      const paymentMethod = await this.getPaymentMethodById(paymentData.paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const customerId = paymentMethod.metadata?.stripe_customer_id;
      if (!customerId) {
        throw new Error('Stripe customer not found');
      }

      // Create payment intent with Stripe
      const { clientSecret, paymentIntentId } = await StripeAPIService.createPaymentIntent(
        paymentData.amount,
        paymentData.currency || 'cad',
        customerId,
        {
          rent_payment_id: rentPayment.id,
          property_id: paymentData.propertyId,
          tenant_id: paymentData.tenantId,
          landlord_id: paymentData.landlordId
        }
      );

      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          payment_id: rentPayment.id,
          transaction_type: 'payment',
          amount: paymentData.amount,
          status: 'pending',
          provider_transaction_id: paymentIntentId,
          metadata: {
            stripe_payment_intent: paymentIntentId,
            stripe_client_secret: clientSecret
          }
        });

      if (transactionError) throw transactionError;

      return {
        success: true,
        transactionId: paymentIntentId,
        message: 'Payment intent created successfully'
      };
    } catch (error) {
      console.error('Error processing rent payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process payment'
      };
    }
  }

  static async processRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    try {
      const { data: rentPayment, error: rentError } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (rentError) throw rentError;

      const refundAmount = amount || rentPayment.amount;
      const refund = await stripe.refunds.create({
        payment_intent: rentPayment.transaction_id,
        amount: Math.round(refundAmount * 100)
      });

      // Create refund transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: paymentId,
          transaction_type: 'refund',
          amount: refundAmount,
          status: refund.status === 'succeeded' ? 'completed' : 'failed',
          provider_transaction_id: refund.id,
          metadata: {
            stripe_refund: refund.id,
            stripe_status: refund.status
          }
        });

      // Update rent payment status
      if (refund.status === 'succeeded') {
        await supabase
          .from('rent_payments')
          .update({ status: 'refunded' })
          .eq('id', paymentId);
      }

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        message: refund.status === 'succeeded' ? 'Refund processed successfully' : 'Refund failed'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process refund'
      };
    }
  }

  // Landlord Operations
  static async processPayout(landlordId: string, amount: number): Promise<PayoutResult> {
    try {
      // Get landlord's Stripe account
      const paymentAccount = await this.getPaymentAccount(landlordId, 'landlord');
      if (!paymentAccount?.stripeAccountId) {
        throw new Error('Landlord Stripe account not found');
      }

      const payout = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'cad',
        destination: paymentAccount.stripeAccountId,
        metadata: {
          landlord_id: landlordId,
          type: 'rent_payout'
        }
      });
    
    return {
      success: true,
        payoutId: payout.id,
        message: 'Payout processed successfully'
    };
  } catch (error) {
      console.error('Error processing payout:', error);
    return {
      success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process payout'
      };
    }
  }

  static async getRentCollection(landlordId: string, period: string): Promise<RentCollection[]> {
    try {
      const { data, error } = await supabase
        .from('rent_payments')
        .select(`
          *,
          property:properties(id, listing_title, address),
          tenant:tenant_id(email, user_metadata)
        `)
        .eq('landlord_id', landlordId)
        .gte('created_at', this.getPeriodStartDate(period))
        .lte('created_at', this.getPeriodEndDate(period))
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(payment => ({
        id: payment.id,
        landlordId: payment.landlord_id,
        propertyId: payment.property_id,
        tenantId: payment.tenant_id,
        amount: payment.amount,
        dueDate: payment.due_date,
        paidDate: payment.paid_date,
        status: payment.status,
        lateFee: payment.late_fee,
        platformFee: payment.platform_fee,
        netAmount: payment.amount - payment.platform_fee
      })) as RentCollection[];
    } catch (error) {
      console.error('Error getting rent collection:', error);
      throw new Error('Failed to get rent collection');
    }
  }

  // Analytics and Reporting
  static async getPaymentAnalytics(userId: string, period: string): Promise<PaymentAnalytics> {
    try {
      const { data, error } = await supabase
        .from('rent_payments')
        .select('*')
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
        .gte('created_at', this.getPeriodStartDate(period))
        .lte('created_at', this.getPeriodEndDate(period));

      if (error) throw error;

      const payments = data as RentPayment[];
      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const paidPayments = payments.filter(p => p.status === 'paid');
      const latePayments = payments.filter(p => p.status === 'late');
      const failedPayments = payments.filter(p => p.status === 'failed');
  
  return {
        totalPayments,
        totalAmount,
        averageAmount: totalPayments > 0 ? totalAmount / totalPayments : 0,
        successRate: totalPayments > 0 ? (paidPayments.length / totalPayments) * 100 : 0,
        latePayments: latePayments.length,
        failedPayments: failedPayments.length,
        monthlyTrend: this.calculateMonthlyTrend(payments)
      };
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw new Error('Failed to get payment analytics');
    }
  }

  // Dashboard Data
  static async getPaymentDashboardData(userId: string): Promise<PaymentDashboardData> {
    try {
      const [upcomingPayments, recentPayments, paymentMethods, analytics] = await Promise.all([
        this.getUpcomingPayments(userId),
        this.getRecentPayments(userId),
        this.getPaymentMethods(userId),
        this.getPaymentAnalytics(userId, '30d')
      ]);

      return {
        upcomingPayments,
        recentPayments,
        paymentMethods,
        analytics
      };
    } catch (error) {
      console.error('Error getting payment dashboard data:', error);
      throw new Error('Failed to get payment dashboard data');
    }
  }

  static async getRentCollectionDashboardData(landlordId: string): Promise<RentCollectionDashboardData> {
    try {
      const collections = await this.getRentCollection(landlordId, '30d');
      const totalCollected = collections.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
      const pendingAmount = collections.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
      const overdueAmount = collections.filter(c => c.status === 'late').reduce((sum, c) => sum + c.amount, 0);

      return {
        totalCollected,
        pendingAmount,
        overdueAmount,
        recentCollections: collections.slice(0, 10),
        tenantPayments: [], // TODO: Implement tenant payment status
        analytics: await this.getPaymentAnalytics(landlordId, '30d')
      };
    } catch (error) {
      console.error('Error getting rent collection dashboard data:', error);
      throw new Error('Failed to get rent collection dashboard data');
    }
  }

  // Helper Methods
  private static calculatePlatformFee(amount: number): number {
    return Math.round(amount * STRIPE_CONFIG.platformFeeRate * 100) / 100; // Platform fee
  }

  private static async getStripeCustomerId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('stripe_account_id')
        .eq('user_id', userId)
        .eq('account_type', 'tenant')
        .single();

      if (error) return null;
      return data.stripe_account_id;
    } catch (error) {
      console.error('Error getting Stripe customer ID:', error);
      return null;
    }
  }

  private static async getPaymentMethodById(methodId: string): Promise<PaymentMethod | null> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', methodId)
      .single();

    if (error) return null;
    return data as PaymentMethod;
  }

  private static getPeriodStartDate(period: string): string {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private static getPeriodEndDate(period: string): string {
    return new Date().toISOString();
  }

  private static calculateMonthlyTrend(payments: RentPayment[]): Array<{ month: string; amount: number; count: number }> {
    const monthlyData: Record<string, { amount: number; count: number }> = {};
    
    payments.forEach(payment => {
      const month = new Date(payment.createdAt).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { amount: 0, count: 0 };
      }
      monthlyData[month].amount += payment.amount;
      monthlyData[month].count += 1;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      amount: data.amount,
      count: data.count
    }));
  }

  private static async getUpcomingPayments(userId: string): Promise<RentPayment[]> {
    const { data, error } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('tenant_id', userId)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(5);

    if (error) throw error;
    return data as RentPayment[];
  }

  private static async getRecentPayments(userId: string): Promise<RentPayment[]> {
    const { data, error } = await supabase
      .from('rent_payments')
      .select('*')
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as RentPayment[];
  }
}