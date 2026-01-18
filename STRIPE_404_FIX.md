# Stripe Payout Setup - 404 Error After Onboarding

## Current Status

✅ **Fixed Issues:**
1. HTTPS requirement error - Edge Function now forces HTTPS URLs
2. Frontend simplified to single API call
3. Onboarding completion handler added to show success message

❌ **Remaining Issue:**
After completing Stripe onboarding, you're redirected to:
```
https://www.roomieai.ca/dashboard/landlord/payments?onboarding=complete
```
But getting a **404: NOT_FOUND** error.

## Root Cause

The 404 error indicates that the **production deployment** (`https://www.roomieai.ca`) either:
1. Doesn't have the latest code deployed
2. Has a routing configuration issue
3. Is missing the `/dashboard/landlord/payments` route

## Solution Options

### Option 1: Deploy Latest Code to Production (Recommended)
You need to deploy the latest code to your production server. The route exists in your local code at:
- `src/App.tsx` line 144: `<Route path="landlord/payments" element={<DigitalWalletPage />} />`

**Steps:**
1. Commit your latest changes
2. Push to your repository
3. Deploy to production (Vercel/Netlify/etc.)

### Option 2: Temporary Workaround - Use Localhost for Testing
For now, you can test the full flow locally by modifying the Edge Function to redirect to localhost AFTER onboarding:

**Modify `supabase/functions/landlord-onboarding/index.ts`:**
```typescript
// Line 167-174: Change this section
// For testing only - redirect back to localhost after Stripe onboarding
let origin = "http://localhost:5173"  // Force localhost for testing

try {
    console.log(`Creating Account Link with origin: ${origin}`)
    const link = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${origin}/dashboard/landlord/payments`,
        return_url: `${origin}/dashboard/landlord/payments?onboarding=complete`,
        type: "account_onboarding",
    })
```

⚠️ **Important**: This is ONLY for testing. Stripe will still create the account in live mode, but you'll be redirected to localhost where the route exists.

### Option 3: Check Production Deployment

1. Go to your production deployment dashboard (Vercel/Netlify/etc.)
2. Check if the latest commit is deployed
3. Look for build logs to see if there were any errors
4. Verify the route is accessible by visiting: `https://www.roomieai.ca/dashboard/landlord/payments` directly

## What Happens After Fix

Once the route is accessible on production:

1. ✅ Stripe onboarding completes successfully
2. ✅ User is redirected to `https://www.roomieai.ca/dashboard/landlord/payments?onboarding=complete`
3. ✅ Success toast appears: "Stripe onboarding completed successfully! Your payout account is now active."
4. ✅ Account status updates to "completed"
5. ✅ "Payouts Enabled" badge shows on the page

## Testing Locally (Current Setup)

Since your local app is running on `http://localhost:5173`, you can test the flow locally:

1. The Edge Function will detect localhost and use `https://roomieai.ca` for Stripe redirects
2. After Stripe onboarding, you'll be sent to production
3. **This is where the 404 occurs** because production doesn't have the route

## Recommended Next Steps

1. **Check your production deployment** - Is the latest code deployed?
2. **If not deployed** - Deploy the latest code to production
3. **If deployed** - Check the build logs for errors
4. **Verify the route** - Visit `https://www.roomieai.ca/dashboard/landlord/payments` directly in your browser

## Files Modified

1. `supabase/functions/landlord-onboarding/index.ts` - HTTPS fix
2. `src/pages/dashboard/DigitalWallet.tsx` - Simplified onboarding + completion handler
3. `src/App.tsx` - Route already exists (no changes needed)

## Need Help?

If you're unsure about your production deployment:
- What platform are you using? (Vercel, Netlify, custom server?)
- Can you access other routes on production?
- When was the last successful deployment?
