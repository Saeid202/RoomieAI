# Stripe Integration Setup Guide

## Environment Variables Required

Add these to your `.env` file:

```bash
# Stripe API Keys (Get these from your Stripe Dashboard)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Connect (for landlord payouts)
REACT_APP_STRIPE_CONNECT_CLIENT_ID=ca_your_connect_client_id_here

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080

# Stripe Webhook Secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Test Mode (set to true for development)
REACT_APP_STRIPE_TEST_MODE=true
```

## Setup Instructions

### 1. Stripe Dashboard Setup
1. Go to https://dashboard.stripe.com/
2. Create an account or log in
3. Get your API keys from the "Developers" > "API keys" section
4. Replace the placeholder values above with your actual keys

### 2. Webhook Configuration
1. Go to "Developers" > "Webhooks" in your Stripe dashboard
2. Create a new endpoint with URL: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_method.attached`
   - `payment_method.detached`
   - `customer.created`
   - `customer.updated`
   - `account.updated`
   - `transfer.created`
   - `transfer.failed`
   - `charge.dispute.created`
   - `charge.dispute.updated`
4. Copy the webhook secret and add it to your environment variables

### 3. Stripe Connect Setup (for Landlord Payouts)
1. Go to "Connect" in your Stripe dashboard
2. Create a new application
3. Copy the Client ID and add it to your environment variables
4. Configure the redirect URLs for your application

## Test Card Numbers

For testing payments, use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Expired card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

Use any future expiry date and any 3-digit CVC.

## Test Bank Account

For testing bank account payments:
- **Account number**: `000123456789`
- **Routing number**: `110000000`

## Features Implemented

### ✅ Completed Features

1. **Payment Method Management**
   - Add credit cards securely via Stripe Elements
   - Save payment methods for future use
   - Set default payment methods
   - Remove payment methods

2. **Payment Processing**
   - Create payment intents for rent payments
   - Process payments securely
   - Handle payment failures gracefully
   - Real-time payment status updates

3. **Landlord Payouts**
   - Automatic transfers to landlord accounts
   - Platform fee calculation (2.5%)
   - Transfer tracking and audit logs

4. **Webhook Handling**
   - Real-time payment status updates
   - Automatic rent payment completion
   - Failed payment handling
   - Dispute management

5. **User Interfaces**
   - Tenant payment dashboard
   - Landlord rent collection dashboard
   - Payment method management
   - Payment history and receipts

### 🔄 Next Steps

1. **Environment Setup**: Configure your Stripe API keys
2. **Webhook Endpoints**: Set up webhook endpoints for production
3. **Testing**: Test with real Stripe test cards
4. **Production**: Switch to live Stripe keys for production

## Security Features

- **PCI Compliance**: All card data handled by Stripe
- **Tokenization**: Payment methods stored as tokens
- **Webhook Verification**: All webhooks verified with signatures
- **Error Handling**: Comprehensive error handling and logging
- **Audit Trail**: Complete transaction logging

## Revenue Model

- **Platform Fee**: 2.5% per transaction
- **Landlord Fee**: 1% of collected rent
- **Late Fees**: 5% of overdue amounts
- **Premium Features**: Advanced analytics and reporting

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com/
- Test Mode: Use test keys for development
- Live Mode: Use live keys for production
