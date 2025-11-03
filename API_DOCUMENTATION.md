# Payment Platform API Documentation

## Overview

The Payment Platform API provides comprehensive payment processing, digital wallet management, auto-pay scheduling, and late fee management capabilities for the RoomieAI rental platform.

## Base URL

```
Production: https://api.roomieai.com/v1
Development: http://localhost:8080/api/v1
```

## Authentication

All API requests require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

API requests are rate limited per IP address:
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes  
- **Payment Processing**: 10 requests per 5 minutes

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": ["Additional error details"],
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

### Error Types

- `VALIDATION` (400) - Invalid input data
- `AUTHENTICATION` (401) - Authentication required
- `AUTHORIZATION` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `RATE_LIMIT` (429) - Rate limit exceeded
- `PAYMENT` (402) - Payment processing error
- `STRIPE` (502) - Stripe API error
- `DATABASE` (500) - Database error
- `INTERNAL` (500) - Internal server error

---

## Payment Accounts

### Create Payment Account

Create a new payment account for a user.

**POST** `/payment-accounts`

**Request Body:**
```json
{
  "accountType": "tenant" | "landlord",
  "currency": "CAD" | "USD"
}
```

**Response:**
```json
{
  "id": "acc_123456789",
  "userId": "user_123456789",
  "accountType": "tenant",
  "balance": 0.00,
  "currency": "CAD",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Get Payment Account

Retrieve payment account details.

**GET** `/payment-accounts/{accountId}`

**Response:**
```json
{
  "id": "acc_123456789",
  "userId": "user_123456789",
  "accountType": "tenant",
  "balance": 1250.75,
  "currency": "CAD",
  "status": "active",
  "stripeAccountId": "acct_123456789",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Payment Methods

### Add Payment Method

Add a new payment method to a user's account.

**POST** `/payment-methods`

**Request Body:**
```json
{
  "methodType": "card" | "bank_account",
  "provider": "stripe",
  "providerId": "pm_123456789",
  "metadata": {
    "last4": "4242",
    "brand": "visa",
    "expMonth": 12,
    "expYear": 2025
  }
}
```

**Response:**
```json
{
  "id": "pm_123456789",
  "userId": "user_123456789",
  "methodType": "card",
  "provider": "stripe",
  "providerId": "pm_123456789",
  "isDefault": false,
  "metadata": {
    "last4": "4242",
    "brand": "visa",
    "expMonth": 12,
    "expYear": 2025
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Payment Methods

Retrieve all payment methods for a user.

**GET** `/payment-methods`

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_123456789",
      "userId": "user_123456789",
      "methodType": "card",
      "provider": "stripe",
      "providerId": "pm_123456789",
      "isDefault": true,
      "metadata": {
        "last4": "4242",
        "brand": "visa"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Set Default Payment Method

Set a payment method as the default.

**PUT** `/payment-methods/{methodId}/default`

**Response:**
```json
{
  "success": true,
  "message": "Default payment method updated"
}
```

### Remove Payment Method

Remove a payment method from the user's account.

**DELETE** `/payment-methods/{methodId}`

**Response:**
```json
{
  "success": true,
  "message": "Payment method removed"
}
```

---

## Rent Payments

### Process Rent Payment

Process a rent payment for a property.

**POST** `/rent-payments`

**Request Body:**
```json
{
  "propertyId": "prop_123456789",
  "tenantId": "user_123456789",
  "landlordId": "user_987654321",
  "amount": 1500.00,
  "currency": "CAD",
  "dueDate": "2024-12-01",
  "paymentMethodId": "pm_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "pi_123456789",
  "message": "Payment intent created successfully",
  "clientSecret": "pi_123456789_secret_abc123"
}
```

### Get Rent Payment

Retrieve rent payment details.

**GET** `/rent-payments/{paymentId}`

**Response:**
```json
{
  "id": "rp_123456789",
  "propertyId": "prop_123456789",
  "tenantId": "user_123456789",
  "landlordId": "user_987654321",
  "amount": 1500.00,
  "currency": "CAD",
  "dueDate": "2024-12-01",
  "paidDate": "2024-12-01T10:30:00Z",
  "status": "paid",
  "paymentMethodId": "pm_123456789",
  "transactionId": "pi_123456789",
  "lateFee": 0.00,
  "platformFee": 37.50,
  "createdAt": "2024-11-01T00:00:00Z"
}
```

### Get Rent Payment History

Retrieve rent payment history for a user.

**GET** `/rent-payments/history`

**Query Parameters:**
- `limit` (optional): Number of payments to return (default: 50)
- `offset` (optional): Number of payments to skip (default: 0)
- `status` (optional): Filter by payment status
- `propertyId` (optional): Filter by property ID

**Response:**
```json
{
  "payments": [
    {
      "id": "rp_123456789",
      "propertyId": "prop_123456789",
      "amount": 1500.00,
      "status": "paid",
      "paidDate": "2024-12-01T10:30:00Z",
      "dueDate": "2024-12-01"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Process Refund

Process a refund for a rent payment.

**POST** `/rent-payments/{paymentId}/refund`

**Request Body:**
```json
{
  "amount": 1500.00,
  "reason": "Tenant moved out early"
}
```

**Response:**
```json
{
  "success": true,
  "refundId": "re_123456789",
  "message": "Refund processed successfully"
}
```

---

## Digital Wallet

### Get Wallet Balance

Retrieve digital wallet balance and information.

**GET** `/wallet/balance`

**Response:**
```json
{
  "id": "wallet_123456789",
  "userId": "user_123456789",
  "balance": 1250.75,
  "currency": "CAD",
  "status": "active",
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Add Funds to Wallet

Add funds to the digital wallet.

**POST** `/wallet/add-funds`

**Request Body:**
```json
{
  "amount": 500.00,
  "paymentMethodId": "pm_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "pi_123456789",
  "message": "Funds added successfully",
  "newBalance": 1750.75
}
```

### Withdraw Funds from Wallet

Withdraw funds from the digital wallet.

**POST** `/wallet/withdraw`

**Request Body:**
```json
{
  "amount": 200.00,
  "bankAccountId": "ba_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "tx_123456789",
  "message": "Withdrawal processed successfully",
  "newBalance": 1550.75
}
```

### Get Wallet Transactions

Retrieve wallet transaction history.

**GET** `/wallet/transactions`

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Number of transactions to skip (default: 0)
- `type` (optional): Filter by transaction type
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_123456789",
      "type": "deposit",
      "amount": 500.00,
      "description": "Added funds via credit card",
      "status": "completed",
      "createdAt": "2024-01-01T10:30:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

## Auto-Pay

### Setup Auto-Pay

Set up automatic recurring payments.

**POST** `/autopay`

**Request Body:**
```json
{
  "propertyId": "prop_123456789",
  "amount": 1500.00,
  "paymentMethodId": "pm_123456789",
  "scheduleType": "monthly" | "biweekly" | "weekly",
  "dayOfMonth": 1,
  "dayOfWeek": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "ap_123456789",
  "tenantId": "user_123456789",
  "propertyId": "prop_123456789",
  "amount": 1500.00,
  "paymentMethodId": "pm_123456789",
  "scheduleType": "monthly",
  "dayOfMonth": 1,
  "isActive": true,
  "nextPaymentDate": "2024-12-01",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Auto-Pay Configurations

Retrieve auto-pay configurations for a user.

**GET** `/autopay`

**Response:**
```json
{
  "configurations": [
    {
      "id": "ap_123456789",
      "propertyId": "prop_123456789",
      "amount": 1500.00,
      "scheduleType": "monthly",
      "isActive": true,
      "nextPaymentDate": "2024-12-01",
      "successRate": 100,
      "totalPayments": 12
    }
  ]
}
```

### Update Auto-Pay Configuration

Update an existing auto-pay configuration.

**PUT** `/autopay/{configId}`

**Request Body:**
```json
{
  "amount": 1600.00,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-pay configuration updated"
}
```

### Cancel Auto-Pay

Cancel an auto-pay configuration.

**DELETE** `/autopay/{configId}`

**Response:**
```json
{
  "success": true,
  "message": "Auto-pay configuration cancelled"
}
```

---

## Late Fee Management

### Get Late Fee Policies

Retrieve late fee policies for properties.

**GET** `/late-fees/policies`

**Response:**
```json
{
  "policies": [
    {
      "id": "policy_123456789",
      "propertyId": "prop_123456789",
      "gracePeriodDays": 5,
      "lateFeeRate": 5.0,
      "maxLateFeeDays": 30,
      "maxLateFeeAmount": 200.00,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Late Fee Policy

Create a new late fee policy for a property.

**POST** `/late-fees/policies`

**Request Body:**
```json
{
  "propertyId": "prop_123456789",
  "gracePeriodDays": 5,
  "lateFeeRate": 5.0,
  "maxLateFeeDays": 30,
  "maxLateFeeAmount": 200.00,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "policy_123456789",
  "propertyId": "prop_123456789",
  "gracePeriodDays": 5,
  "lateFeeRate": 5.0,
  "maxLateFeeDays": 30,
  "maxLateFeeAmount": 200.00,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Late Fees

Retrieve late fees for a landlord.

**GET** `/late-fees`

**Query Parameters:**
- `status` (optional): Filter by late fee status
- `propertyId` (optional): Filter by property ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "lateFees": [
    {
      "id": "lf_123456789",
      "rentPaymentId": "rp_123456789",
      "tenantId": "user_123456789",
      "propertyId": "prop_123456789",
      "originalAmount": 1500.00,
      "lateFeeAmount": 75.00,
      "totalAmount": 1575.00,
      "dueDate": "2024-11-01",
      "lateDate": "2024-11-06",
      "daysLate": 5,
      "status": "pending",
      "createdAt": "2024-11-06T00:00:00Z"
    }
  ]
}
```

### Collect Late Fee

Collect a late fee payment.

**POST** `/late-fees/{lateFeeId}/collect`

**Request Body:**
```json
{
  "paymentMethodId": "pm_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "pi_123456789",
  "message": "Late fee collected successfully"
}
```

### Waive Late Fee

Waive a late fee.

**POST** `/late-fees/{lateFeeId}/waive`

**Request Body:**
```json
{
  "reason": "First-time late payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Late fee waived successfully"
}
```

---

## Analytics and Reporting

### Get Payment Analytics

Retrieve payment analytics for a user.

**GET** `/analytics/payments`

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `propertyId` (optional): Filter by property ID

**Response:**
```json
{
  "totalPayments": 25,
  "totalAmount": 37500.00,
  "averageAmount": 1500.00,
  "successRate": 96.0,
  "latePayments": 1,
  "failedPayments": 0,
  "monthlyTrend": [
    {
      "month": "2024-10",
      "amount": 1500.00,
      "count": 1
    }
  ]
}
```

### Get Financial Report

Generate a financial report for a landlord.

**GET** `/analytics/financial-report`

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `propertyId` (optional): Filter by property ID

**Response:**
```json
{
  "period": "2024-11",
  "totalIncome": 4500.00,
  "totalExpenses": 0.00,
  "netIncome": 4500.00,
  "platformFees": 112.50,
  "lateFees": 75.00,
  "properties": [
    {
      "propertyId": "prop_123456789",
      "propertyName": "Downtown Apartment",
      "income": 1500.00,
      "expenses": 0.00,
      "netIncome": 1500.00
    }
  ]
}
```

---

## Webhooks

### Stripe Webhook Events

The platform receives webhooks from Stripe for real-time payment updates.

**POST** `/webhooks/stripe`

**Headers:**
```
Stripe-Signature: t=1234567890,v1=signature
Content-Type: application/json
```

**Supported Events:**
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

---

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @roomieai/payment-sdk
```

```typescript
import { PaymentClient } from '@roomieai/payment-sdk';

const client = new PaymentClient({
  apiKey: 'your_api_key',
  environment: 'production' // or 'sandbox'
});

// Process a payment
const payment = await client.payments.create({
  propertyId: 'prop_123',
  amount: 1500,
  paymentMethodId: 'pm_123'
});
```

### React Components

```bash
npm install @roomieai/payment-components
```

```tsx
import { PaymentForm, DigitalWallet, AutoPayManager } from '@roomieai/payment-components';

function PaymentPage() {
  return (
    <div>
      <PaymentForm 
        amount={1500}
        onSuccess={(payment) => console.log('Payment successful', payment)}
      />
      <DigitalWallet />
      <AutoPayManager />
    </div>
  );
}
```

---

## Testing

### Test Cards

Use these test card numbers for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Expired card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

Use any future expiry date and any 3-digit CVC.

### Test Bank Account

- **Account number**: `000123456789`
- **Routing number**: `110000000`

---

## Support

For API support and questions:

- **Documentation**: https://docs.roomieai.com
- **Support Email**: api-support@roomieai.com
- **Status Page**: https://status.roomieai.com
- **GitHub**: https://github.com/roomieai/payment-api

---

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial release
- Payment processing
- Digital wallet
- Auto-pay scheduling
- Late fee management
- Analytics and reporting
