# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project
- Go to **Settings** → **Environment Variables**

### 2. Add these variables:

#### KYC/Shufti Configuration
```
SHUFTI_CLIENT_ID
Value: 1f58fbfc920c2ec2c9b286f776e041892788ea9b242ae505f70a4271255869fc
Environment: Production (and Staging if you have it)
```

```
SHUFTI_SECRET_KEY
Value: z8BdBavwUqBesrMRtKZnucoStTwiS06R
Environment: Production (and Staging if you have it)
```

```
SHUFTI_WEBHOOK_SECRET
Value: disabled
Environment: Production (and Staging if you have it)
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL
Value: https://your-domain.vercel.app
Environment: Production

Value: http://localhost:3000
Environment: Development (Preview branches)
```

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL
Value: your_supabase_url
Environment: All environments
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: your_supabase_service_role_key
Environment: All environments
```

### 3. Important Notes

#### Environment Types
- **Production**: Live site
- **Preview**: Pull request deployments
- **Development**: Local development

#### Sensitive Variables
- `SHUFTI_SECRET_KEY` should be marked as **sensitive**
- `SUPABASE_SERVICE_ROLE_KEY` should be marked as **sensitive**
- These won't be visible in the UI after saving

#### NEXT_PUBLIC_ Prefix
- Variables with `NEXT_PUBLIC_` prefix are exposed to browser
- Only `NEXT_PUBLIC_APP_URL` needs this prefix
- KYC credentials should NOT have this prefix (server-side only)

### 4. Webhook URL for Shufti

After deploying to Vercel, update your Shufti webhook URL:
```
https://your-domain.vercel.app/api/kyc/webhook/shufti
```

### 5. Deployment Steps

1. **Add environment variables** in Vercel dashboard
2. **Redeploy** your application:
   ```bash
   vercel --prod
   ```
3. **Update webhook URL** in Shufti dashboard
4. **Test the KYC flow** on production

### 6. Verification

After deployment, verify the variables are set:
```bash
# Check production environment
vercel env ls

# Pull environment variables locally (if needed)
vercel env pull .env.production
```

### 7. Troubleshooting

#### Variables Not Working
- Ensure exact variable names match
- Check environment assignments (Production vs Preview)
- Redeploy after adding variables

#### Webhook Issues
- Verify webhook URL is accessible
- Check Vercel function logs
- Ensure Shufti IP addresses can reach your endpoint

#### Common Mistakes
- ❌ Adding `NEXT_PUBLIC_` prefix to secret keys
- ❌ Forgetting to redeploy after adding variables
- ❌ Using wrong environment (Preview vs Production)

### 8. Security Best Practices

- ✅ Mark sensitive variables as **sensitive**
- ✅ Use different values for staging vs production
- ✅ Regularly rotate API keys
- ✅ Monitor Vercel function logs for webhook issues
- ✅ Use Vercel's built-in IP protection (Shufti IPs can still reach webhooks)

### 9. Local Development

For local development, create a `.env.local` file:
```env
SHUFTI_CLIENT_ID=1f58fbfc920c2ec2c9b286f776e041892788ea9b242ae505f70a4271255869fc
SHUFTI_SECRET_KEY=z8BdBavwUqBesrMRtKZnucoStTwiS06R
SHUFTI_WEBHOOK_SECRET=disabled
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Never commit `.env.local` to git!**
