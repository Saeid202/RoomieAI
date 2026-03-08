# Set Stripe Secret Key in Supabase - CRITICAL!

## The Problem
Your Edge Functions can't access the Stripe API because the `STRIPE_SECRET_KEY` environment variable isn't set in Supabase.

The `.env` file only works for your local frontend code, NOT for Edge Functions which run on Supabase's servers.

## Solution: Set Supabase Secrets

### Option 1: Using Supabase CLI (Recommended)

Run this command in your terminal:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F
```

### Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `bjesofgfbuyzjamyliys`
3. Click on "Edge Functions" in the left sidebar
4. Click on "Manage secrets" or "Settings"
5. Add a new secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F`
6. Click "Save"

## After Setting the Secret

The Edge Functions will automatically restart and pick up the new secret. You don't need to redeploy.

## Test It

1. Go back to your Digital Wallet page
2. Try to make a payment again
3. Check the browser console for logs

## Verify the Secret is Set

Run this command to list all secrets:

```bash
supabase secrets list
```

You should see `STRIPE_SECRET_KEY` in the list.

## Common Issues

### Issue: "Command not found: supabase"
**Solution:** Install Supabase CLI first (see SUPABASE_CLI_INSTALL_WINDOWS.md)

### Issue: "Not logged in"
**Solution:** Run `supabase login` first

### Issue: "Project not linked"
**Solution:** Run `supabase link --project-ref bjesofgfbuyzjamyliys`

## Why This is Needed

Edge Functions run on Supabase's servers, not on your local machine. They need their own environment variables set in Supabase, separate from your local `.env` file.

Think of it like this:
- `.env` file = Environment variables for your LOCAL frontend code
- Supabase secrets = Environment variables for REMOTE Edge Functions

## Next Steps After Setting Secret

1. Set the secret using one of the methods above
2. Wait 10-15 seconds for Edge Functions to restart
3. Try making a payment again
4. It should work now!

## Additional Secrets You Might Need

If you're using other services in Edge Functions, you may also need to set:
- `GEMINI_API_KEY` (for AI features)
- `SUPABASE_SERVICE_ROLE_KEY` (usually auto-set)
- Any other API keys your Edge Functions use

Set them the same way:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```
