# Stripe Payout Setup - HTTPS Error Fix

## Problem
When attempting to complete the Stripe payout setup, the following error occurred:
```
Failed to load resource: the server responded with a status of 500 ()
Stripe link error: Stripe link error: livemode requests must always be redirected via HTTPS.
```

## Root Cause
The issue was caused by the Edge Function (`landlord-onboarding`) using the `origin` header from the request to construct redirect URLs for Stripe. When running the application locally on `http://localhost:5173`, Stripe rejected the request because:

1. **Live Stripe keys require HTTPS**: The application is using live Stripe API keys (not test keys)
2. **Localhost uses HTTP**: Local development runs on `http://localhost:5173`
3. **Stripe's security requirement**: Stripe's live mode requires all redirect URLs to use HTTPS protocol

## Solution Implemented

### 1. Edge Function Fix (`supabase/functions/landlord-onboarding/index.ts`)
Modified the origin detection logic to force HTTPS URLs:

```typescript
// Before
const origin = req.headers.get("origin") || "https://roomieai.ca"

// After
let origin = req.headers.get("origin") || "https://roomieai.ca"

// Force HTTPS for Stripe redirects - localhost won't work with live Stripe keys
if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    console.log("Detected localhost origin, using production URL for Stripe redirect")
    origin = "https://roomieai.ca"
}
```

**What this does:**
- Detects if the request is coming from localhost (HTTP)
- Automatically uses the production URL (`https://roomieai.ca`) for Stripe redirects
- Ensures all redirect URLs use HTTPS, satisfying Stripe's requirements

### 2. Frontend Simplification (`src/pages/dashboard/DigitalWallet.tsx`)
Simplified the onboarding flow from two API calls to one:

```typescript
// Before: Made 2 separate calls
// 1. Create account
// 2. Create link

// After: Single call that handles both
const { data, error } = await supabase.functions.invoke('landlord-onboarding', {
  body: {}
});
```

**Why this change:**
- The Edge Function already handles both account creation AND link generation in a single request
- The frontend was unnecessarily making two calls
- Simplified code is more maintainable and reduces potential errors

## Deployment Required

⚠️ **IMPORTANT**: The Edge Function changes need to be deployed to Supabase for the fix to take effect.

### Option 1: Deploy via Supabase CLI (if installed)
```bash
supabase functions deploy landlord-onboarding
```

### Option 2: Deploy via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar
4. Find `landlord-onboarding` function
5. Click **Deploy new version**
6. Copy the contents of `supabase/functions/landlord-onboarding/index.ts`
7. Paste and deploy

## Testing After Deployment

1. Refresh your local application
2. Navigate to the Payments page (landlord view)
3. Click "Complete Payout Setup"
4. You should now be successfully redirected to Stripe's onboarding flow
5. After completing Stripe onboarding, you'll be redirected back to the production site

## Notes

- **Local Development**: When testing locally, the Stripe redirect will send you to the production URL (`https://roomieai.ca`) after completing onboarding
- **Production**: When running on production, it will redirect back to the production URL normally
- **TypeScript Errors**: The IDE shows TypeScript errors for the Deno Edge Function - these are false positives and can be ignored (Deno uses different module resolution than Node.js)

## Verification

After deployment, check the Supabase Edge Function logs to confirm:
```
Detected localhost origin, using production URL for Stripe redirect
Creating Account Link with origin: https://roomieai.ca
```
