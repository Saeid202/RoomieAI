# Fix Localhost Stripe Key Mismatch

## The Problem
- **Localhost frontend**: Uses TEST keys from `.env` ✅
- **Supabase backend**: Has PRODUCTION keys ❌
- **Result**: Keys don't match, payments fail

## The Solution

You need to set TEST keys in Supabase for development:

### Step 1: Set TEST Key in Supabase
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F --project-ref bjesofgfbuyzjamyliys
```

This sets your TEST key (from `.env`) in Supabase.

### Step 2: Verify
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```

### Step 3: Test Payment
Now try your payment on localhost - it should work!

## Understanding the Setup

### For Development (Localhost)
- **Frontend (.env)**: TEST keys
- **Supabase secrets**: TEST keys
- **Both must match!**

### For Production (Vercel)
- **Frontend (Vercel env vars)**: LIVE keys
- **Supabase secrets**: LIVE keys
- **Both must match!**

## The Issue with Your Current Setup

You currently have:
```
Localhost → TEST keys (frontend) + LIVE keys (Supabase) = ❌ MISMATCH
Vercel → LIVE keys (frontend) + LIVE keys (Supabase) = ✅ WORKS
```

After the fix:
```
Localhost → TEST keys (frontend) + TEST keys (Supabase) = ✅ WORKS
Vercel → LIVE keys (frontend) + LIVE keys (Supabase) = ✅ WORKS
```

## Wait, Won't This Break Production?

**No!** Here's why:

### Option 1: Use Same Supabase Project (Current Setup)
If you use the same Supabase project for both dev and prod:
- Set TEST keys in Supabase for development
- When ready for production, switch to LIVE keys
- **Downside**: Can't test and run production simultaneously

### Option 2: Separate Supabase Projects (Recommended)
Create two Supabase projects:
1. **Development project**: TEST Stripe keys
2. **Production project**: LIVE Stripe keys

Then:
- Localhost uses dev project + TEST keys
- Vercel uses prod project + LIVE keys

## Quick Fix for Now

Since you're still testing, just set TEST keys in Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F --project-ref bjesofgfbuyzjamyliys
```

When you're ready to deploy to production:
1. Create a new Supabase project for production
2. Set LIVE keys in that project
3. Point Vercel to the production Supabase project

## Summary

**Right now, run this command:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F --project-ref bjesofgfbuyzjamyliys
```

This will make localhost work. When you deploy to production later, you can either:
- Switch the keys back to LIVE (if using same project)
- Use a separate production Supabase project (recommended)
