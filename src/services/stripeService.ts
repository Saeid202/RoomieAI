import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe
const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Create Stripe Customer
  static async createCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          user_id: userId
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  // Create Payment Method
  static async createPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw new Error('Failed to create payment method');
    }
  }

  // Create Payment Intent
  static async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    paymentMethodId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create Setup Intent for saving payment methods
  static async createSetupIntent(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        usage: 'off_session',
        confirm: true
      });

      return setupIntent;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
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
        metadata
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
    amount?: number
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  // Get Payment Methods for Customer
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
      console.error('Error getting customer payment methods:', error);
      throw new Error('Failed to get customer payment methods');
    }
  }

  // Delete Payment Method
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
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

  // Create Webhook Endpoint
  static async createWebhookEndpoint(
    url: string,
    events: string[]
  ): Promise<Stripe.WebhookEndpoint> {
    try {
      const webhookEndpoint = await stripe.webhookEndpoints.create({
        url,
        enabled_events: events as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      });

      return webhookEndpoint;
    } catch (error) {
      console.error('Error creating webhook endpoint:', error);
      throw new Error('Failed to create webhook endpoint');
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
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
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
            stripe_status: paymentIntent.status
          }
        });

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
            failure_reason: paymentIntent.last_payment_error?.message
          }
        });

      console.log(`Payment failed for rent payment ${rentPaymentId}`);
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
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

  private static async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    try {
      // Update landlord account status in database
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

  // Utility Methods
  static formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  static parseAmount(amount: string): number {
    return Math.round(parseFloat(amount) * 100);
  }

  static getSupportedCurrencies(): string[] {
    return ['cad', 'usd', 'eur', 'gbp'];
  }

  static getSupportedCountries(): string[] {
    return ['CA', 'US', 'GB', 'AU'];
  }
}
