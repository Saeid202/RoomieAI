# Common Error Fixes for Stripe Financial Connections

## Error 1: FunctionsHttpError: Edge Function returned a non-2xx status code

**Causes:**
- STRIPE_SECRET_KEY not configured in Supabase
- Function deployment issues
- Network connectivity problems

**Fixes:**
1. Check Supabase Dashboard → Edge Functions → manage-financial-connections → Logs
2. Verify STRIPE_SECRET_KEY is set in Supabase Edge Function secrets
3. Redeploy function: `npx supabase functions deploy manage-financial-connections`

## Error 2: "Invalid user token"

**Causes:**
- User not logged in
- Session expired
- Authentication issues

**Fixes:**
1. Log out and log back in
2. Clear browser cache
3. Check if user session is valid

## Error 3: "STRIPE_SECRET_KEY is missing"

**Causes:**
- Environment variable not set
- Function not configured

**Fixes:**
1. Go to Supabase Dashboard → Edge Functions → manage-financial-connections
2. Click "Secrets" → Add Secret
3. Name: STRIPE_SECRET_KEY
4. Value: Your Stripe secret key (sk_test_... or sk_live_...)

## Error 4: "Invalid client secret format"

**Causes:**
- Stripe API version mismatch
- Canadian bank support issues
- Configuration problems

**Fixes:**
1. Verify Stripe API version (2024-06-20)
2. Check if Canadian banks are supported
3. Update function configuration

## Error 5: CORS issues

**Causes:**
- Frontend and backend domains mismatch
- CORS headers not properly set

**Fixes:**
1. Check function CORS headers
2. Verify frontend URL configuration
3. Update return URLs in function
