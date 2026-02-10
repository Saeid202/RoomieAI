# Shufti Webhook Setup Guide

## Overview
Shufti doesn't use webhook secrets for authentication. Instead, they use IP whitelisting to secure webhook endpoints.

## Required Configuration

### 1. Environment Variables
Add these to your `.env.local` file:

```env
SHUFTI_CLIENT_ID=1f58fbfc920c2ec2c9b286f776e041892788ea9b242ae505f70a4271255869fc
SHUFTI_SECRET_KEY=z8BdBavwUqBesrMRtKZnucoStTwiS06R
SHUFTI_WEBHOOK_SECRET=disabled
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Webhook URL Configuration
In your Shufti dashboard, set the webhook URL to:
```
https://your-domain.com/api/kyc/webhook/shufti
```

### 3. IP Whitelisting (Security)
Shufti secures webhooks by only allowing requests from their IP addresses. 
You need to whitelist Shufti's IP addresses in your firewall/load balancer.

**Current Shufti IP Addresses:**
- `52.30.148.1`
- `52.210.247.195`
- `34.244.169.91`
- `34.244.169.92`
- `34.244.169.93`
- `34.244.169.94`

*Note: Check Shufti documentation for the most current IP list*

### 4. Vercel Deployment (if using Vercel)
If deploying to Vercel, you don't need to configure IP whitelisting as Vercel handles this at their infrastructure level.

### 5. Testing Webhooks
For local development, you can use ngrok to test webhooks:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL in Shufti webhook configuration
# Example: https://abc123.ngrok.io/api/kyc/webhook/shufti
```

## Webhook Events Handled

The webhook handler processes these Shufti events:

1. **verification.accepted** - User successfully verified
2. **verification.declined** - Verification failed/rejected
3. **request.cancelled** - User cancelled the process
4. **request.timeout** - Verification session expired

## Security Considerations

1. **IP Whitelisting**: Only allow requests from Shufti's IP addresses
2. **Content-Type Validation**: Ensure requests are JSON
3. **Required Fields**: Validate `event` and `reference` fields exist
4. **Database Validation**: Verify reference ID exists in your database
5. **Error Logging**: Log all webhook events for debugging

## Database Schema

The webhook updates the `kyc_verifications` table:

```sql
-- Status changes based on webhook events
'not_verified' -> 'pending' (when verification starts)
'pending' -> 'verified' (verification.accepted)
'pending' -> 'rejected' (verification.declined)
'pending' -> 'cancelled' (request.cancelled)
'pending' -> 'expired' (request.timeout)
```

## Monitoring

Monitor these metrics:
- Webhook success/failure rates
- Verification completion times
- Rejection reasons
- API response times

## Troubleshooting

### Common Issues:

1. **404 Errors**: Check webhook URL is correct and accessible
2. **400 Errors**: Verify request payload structure
3. **Database Errors**: Check database connection and schema
4. **Timeout Issues**: Increase webhook processing timeout

### Debug Logging:
Enable debug logging in development:
```env
NODE_ENV=development
```

## Production Checklist

- [ ] Add Shufti IPs to firewall whitelist
- [ ] Set production webhook URL in Shufti dashboard
- [ ] Configure monitoring and alerting
- [ ] Test webhook with real verification
- [ ] Set up error notification system
- [ ] Document verification process for users
