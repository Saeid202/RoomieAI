#!/bin/bash

# PAD Payment Functions Deployment Script
# This script deploys all Canadian PAD payment functions to Supabase

echo "🚀 Deploying Canadian PAD Payment Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Deploy functions
echo "📦 Deploying functions..."
echo ""

echo "1️⃣  Deploying create-pad-payment-method..."
supabase functions deploy create-pad-payment-method
if [ $? -eq 0 ]; then
    echo "✅ create-pad-payment-method deployed"
else
    echo "❌ Failed to deploy create-pad-payment-method"
    exit 1
fi
echo ""

echo "2️⃣  Deploying create-pad-payment-intent..."
supabase functions deploy create-pad-payment-intent
if [ $? -eq 0 ]; then
    echo "✅ create-pad-payment-intent deployed"
else
    echo "❌ Failed to deploy create-pad-payment-intent"
    exit 1
fi
echo ""

echo "3️⃣  Deploying pad-payment-webhook..."
supabase functions deploy pad-payment-webhook
if [ $? -eq 0 ]; then
    echo "✅ pad-payment-webhook deployed"
else
    echo "❌ Failed to deploy pad-payment-webhook"
    exit 1
fi
echo ""

# List deployed functions
echo "📋 Deployed functions:"
supabase functions list
echo ""

echo "🎉 All PAD payment functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set Stripe secrets:"
echo "   supabase secrets set STRIPE_SECRET_KEY=sk_test_..."
echo "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "2. Configure Stripe webhook endpoint:"
echo "   URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/pad-payment-webhook"
echo ""
echo "3. Test the payment flow in your app"
echo ""
echo "See PHASE_3_SETUP_GUIDE.md for detailed instructions"
