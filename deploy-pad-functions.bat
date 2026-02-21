@echo off
REM PAD Payment Functions Deployment Script for Windows
REM This script deploys all Canadian PAD payment functions to Supabase

echo.
echo 🚀 Deploying Canadian PAD Payment Functions...
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo Install it with: npm install -g supabase
    echo Or visit: https://supabase.com/docs/guides/cli
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if logged in
echo 🔐 Checking Supabase authentication...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Supabase
    echo Run: supabase login
    exit /b 1
)

echo ✅ Authenticated
echo.

REM Deploy functions
echo 📦 Deploying functions...
echo.

echo 1️⃣  Deploying create-pad-payment-method...
supabase functions deploy create-pad-payment-method
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to deploy create-pad-payment-method
    exit /b 1
)
echo ✅ create-pad-payment-method deployed
echo.

echo 2️⃣  Deploying create-pad-payment-intent...
supabase functions deploy create-pad-payment-intent
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to deploy create-pad-payment-intent
    exit /b 1
)
echo ✅ create-pad-payment-intent deployed
echo.

echo 3️⃣  Deploying pad-payment-webhook...
supabase functions deploy pad-payment-webhook
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to deploy pad-payment-webhook
    exit /b 1
)
echo ✅ pad-payment-webhook deployed
echo.

REM List deployed functions
echo 📋 Deployed functions:
supabase functions list
echo.

echo 🎉 All PAD payment functions deployed successfully!
echo.
echo 📝 Next steps:
echo 1. Set Stripe secrets:
echo    supabase secrets set STRIPE_SECRET_KEY=sk_test_...
echo    supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
echo.
echo 2. Configure Stripe webhook endpoint:
echo    URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/pad-payment-webhook
echo.
echo 3. Test the payment flow in your app
echo.
echo See PHASE_3_SETUP_GUIDE.md for detailed instructions
echo.
pause
