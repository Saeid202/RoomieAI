import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_CONFIG, STRIPE_WEBHOOK_EVENTS, PAYMENT_STATUS_MAP } from '@/config/stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F', {
  apiVersion: '2023-10-16',
});

export class StripeAPIService {
  // Create Payment Intent
  static async createPaymentIntent(
    amount: number,
    currency: string = 'cad',
    customerId?: string,
    metadata: Record<string, string> = {}
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          ...metadata,
          platform: 'roomieai',
          version: '1.0',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create Setup Intent for saving payment methods
  static async createSetupIntent(
    customerId?: string,
    metadata: Record<string, string> = {}
  ): Promise<{ clientSecret: string; setupIntentId: string }> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          ...metadata,
          platform: 'roomieai',
        },
      });

      return {
        clientSecret: setupIntent.client_secret!,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // Create Stripe Customer
  static async createCustomer(
    email: string,
    name?: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          platform: 'roomieai',
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Get Customer Payment Methods
  static async getCustomerPaymentMethods(
    customerId: string,
    type: 'card' | 'bank_account' = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: type,
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  // Attach Payment Method to Customer
  static async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw new Error('Failed to attach payment method');
    }
  }

  // Detach Payment Method from Customer
  static async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw new Error('Failed to detach payment method');
    }
  }

  // Create Connected Account for Landlords
  static async createConnectedAccount(
    email: string,
    country: string = 'CA',
    type: 'express' | 'standard' = 'express'
  ): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.create({
        type: type,
        country: country,
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          platform: 'roomieai',
        },
      });

      return account;
    } catch (error) {
      console.error('Error creating connected account:', error);
      throw new Error('Failed to create connected account');
    }
  }

  // Create Account Link for onboarding
  static async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new Error('Failed to create account link');
    }
  }

  // Create Transfer to Connected Account
  static async createTransfer(
    amount: number,
    destination: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'cad',
        destination: destination,
        metadata: {
          ...metadata,
          platform: 'roomieai',
        },
      });

      return transfer;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error('Failed to create transfer');
    }
  }

  // Create Refund
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason,
        metadata: {
          platform: 'roomieai',
        },
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  // Get Payment Intent
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error getting payment intent:', error);
      throw new Error('Failed to get payment intent');
    }
  }

  // Get Account
  static async getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      console.error('Error getting account:', error);
      throw new Error('Failed to get account');
    }
  }

  // Verify Webhook Signature
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  // Handle Webhook Events
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      console.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;
        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
          break;
        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Stripe.Customer);
          break;
        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Stripe.Customer);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;
        case 'transfer.failed':
          await this.handleTransferFailed(event.data.object as Stripe.Transfer);
          break;
        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;
        case 'charge.dispute.updated':
          await this.handleDisputeUpdated(event.data.object as Stripe.Dispute);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Webhook Event Handlers
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const rentPaymentId = paymentIntent.metadata.rent_payment_id;
      if (!rentPaymentId) return;

      // Update rent payment status
      await supabase
        .from('rent_payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          transaction_id: paymentIntent.id
        })
        .eq('id', rentPaymentId);

      // Create payment transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: rentPaymentId,
          transaction_type: 'payment',
          amount: paymentIntent.amount / 100,
          status: 'completed',
          provider_transaction_id: paymentIntent.id,
          metadata: {
            stripe_payment_intent: paymentIntent.id,
            stripe_status: paymentIntent.status,
            stripe_charges: JSON.stringify(paymentIntent.charges)
          }
        });

      // Process payout to landlord
      const landlordId = paymentIntent.metadata.landlord_id;
      if (landlordId) {
        const platformFee = paymentIntent.amount * STRIPE_CONFIG.platformFeeRate;
        const netAmount = paymentIntent.amount - platformFee;
        
        await this.processLandlordPayout(landlordId, netAmount / 100, rentPaymentId);
      }

      console.log(`Payment succeeded for rent payment ${rentPaymentId}`);
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const rentPaymentId = paymentIntent.metadata.rent_payment_id;
      if (!rentPaymentId) return;

      // Update rent payment status
      await supabase
        .from('rent_payments')
        .update({
          status: 'failed',
          transaction_id: paymentIntent.id
        })
        .eq('id', rentPaymentId);

      // Create payment transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: rentPaymentId,
          transaction_type: 'payment',
          amount: paymentIntent.amount / 100,
          status: 'failed',
          provider_transaction_id: paymentIntent.id,
          metadata: {
            stripe_payment_intent: paymentIntent.id,
            stripe_status: paymentIntent.status,
            failure_reason: paymentIntent.last_payment_error?.message,
            failure_code: paymentIntent.last_payment_error?.code
          }
        });

      console.log(`Payment failed for rent payment ${rentPaymentId}`);
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
    }
  }

  private static async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const rentPaymentId = paymentIntent.metadata.rent_payment_id;
      if (!rentPaymentId) return;

      // Update rent payment status
      await supabase
        .from('rent_payments')
        .update({
          status: 'cancelled',
          transaction_id: paymentIntent.id
        })
        .eq('id', rentPaymentId);

      console.log(`Payment canceled for rent payment ${rentPaymentId}`);
    } catch (error) {
      console.error('Error handling payment intent canceled:', error);
    }
  }

  private static async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    try {
      // Log payment method attachment
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: '', // No specific payment ID for method attachment
          transaction_type: 'payment',
          amount: 0,
          status: 'completed',
          provider_transaction_id: paymentMethod.id,
          metadata: {
            stripe_payment_method: paymentMethod.id,
            stripe_customer: paymentMethod.customer as string,
            event_type: 'payment_method.attached'
          }
        });

      console.log(`Payment method attached: ${paymentMethod.id}`);
    } catch (error) {
      console.error('Error handling payment method attached:', error);
    }
  }

  private static async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    try {
      // Log payment method detachment
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: '',
          transaction_type: 'payment',
          amount: 0,
          status: 'completed',
          provider_transaction_id: paymentMethod.id,
          metadata: {
            stripe_payment_method: paymentMethod.id,
            stripe_customer: paymentMethod.customer as string,
            event_type: 'payment_method.detached'
          }
        });

      console.log(`Payment method detached: ${paymentMethod.id}`);
    } catch (error) {
      console.error('Error handling payment method detached:', error);
    }
  }

  private static async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    try {
      // Update user record with Stripe customer ID
      await supabase
        .from('payment_accounts')
        .update({
          stripe_account_id: customer.id
        })
        .eq('user_id', customer.metadata.user_id);

      console.log(`Customer created: ${customer.id}`);
    } catch (error) {
      console.error('Error handling customer created:', error);
    }
  }

  private static async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    try {
      console.log(`Customer updated: ${customer.id}`);
    } catch (error) {
      console.error('Error handling customer updated:', error);
    }
  }

  private static async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    try {
      // Update landlord account status
      await supabase
        .from('payment_accounts')
        .update({
          stripe_account_id: account.id,
          status: account.details_submitted ? 'active' : 'pending'
        })
        .eq('stripe_account_id', account.id);

      console.log(`Account updated: ${account.id}`);
    } catch (error) {
      console.error('Error handling account updated:', error);
    }
  }

  private static async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    try {
      const landlordId = transfer.metadata.landlord_id;
      if (!landlordId) return;

      // Log transfer for audit purposes
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: transfer.metadata.payment_id || '',
          transaction_type: 'transfer',
          amount: transfer.amount / 100,
          status: 'completed',
          provider_transaction_id: transfer.id,
          metadata: {
            stripe_transfer: transfer.id,
            landlord_id: landlordId,
            destination: transfer.destination
          }
        });

      console.log(`Transfer created for landlord ${landlordId}`);
    } catch (error) {
      console.error('Error handling transfer created:', error);
    }
  }

  private static async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    try {
      const landlordId = transfer.metadata.landlord_id;
      if (!landlordId) return;

      // Log failed transfer
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: transfer.metadata.payment_id || '',
          transaction_type: 'transfer',
          amount: transfer.amount / 100,
          status: 'failed',
          provider_transaction_id: transfer.id,
          metadata: {
            stripe_transfer: transfer.id,
            landlord_id: landlordId,
            destination: transfer.destination,
            failure_reason: 'Transfer failed'
          }
        });

      console.log(`Transfer failed for landlord ${landlordId}`);
    } catch (error) {
      console.error('Error handling transfer failed:', error);
    }
  }

  private static async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    try {
      // Log dispute creation
      await supabase
        .from('payment_transactions')
        .insert({
          payment_id: '',
          transaction_type: 'payment',
          amount: dispute.amount / 100,
          status: 'pending',
          provider_transaction_id: dispute.id,
          metadata: {
            stripe_dispute: dispute.id,
            stripe_charge: dispute.charge,
            dispute_reason: dispute.reason,
            dispute_status: dispute.status,
            event_type: 'charge.dispute.created'
          }
        });

      console.log(`Dispute created: ${dispute.id}`);
    } catch (error) {
      console.error('Error handling dispute created:', error);
    }
  }

  private static async handleDisputeUpdated(dispute: Stripe.Dispute): Promise<void> {
    try {
      // Update dispute status
      await supabase
        .from('payment_transactions')
        .update({
          status: dispute.status === 'won' ? 'completed' : 'failed',
          metadata: {
            stripe_dispute: dispute.id,
            stripe_charge: dispute.charge,
            dispute_reason: dispute.reason,
            dispute_status: dispute.status,
            event_type: 'charge.dispute.updated'
          }
        })
        .eq('provider_transaction_id', dispute.id);

      console.log(`Dispute updated: ${dispute.id}`);
    } catch (error) {
      console.error('Error handling dispute updated:', error);
    }
  }

  // Helper method to process landlord payouts
  private static async processLandlordPayout(
    landlordId: string,
    amount: number,
    rentPaymentId: string
  ): Promise<void> {
    try {
      // Get landlord's Stripe account
      const { data: paymentAccount } = await supabase
        .from('payment_accounts')
        .select('stripe_account_id')
        .eq('user_id', landlordId)
        .eq('account_type', 'landlord')
        .single();

      if (!paymentAccount?.stripe_account_id) {
        console.error('Landlord Stripe account not found');
        return;
      }

      // Create transfer to landlord
      const transfer = await this.createTransfer(
        amount,
        paymentAccount.stripe_account_id,
        {
          landlord_id: landlordId,
          payment_id: rentPaymentId,
          type: 'rent_payout'
        }
      );

      console.log(`Payout processed for landlord ${landlordId}: ${transfer.id}`);
    } catch (error) {
      console.error('Error processing landlord payout:', error);
    }
  }
}
