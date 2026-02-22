# Fix: Deploy AI Property Assistant Tables

## Problem
Error: "Failed to fetch property processing statuses"

This happens because the AI Property Assistant database tables haven't been deployed to production yet.

## Solution

You need to run the migration that creates the AI tables. You have two options:

### Option 1: Run Migration via Supabase CLI (Recommended)

```bash
# Make sure you're in the project directory
cd C:\Users\shaba\RoomieAI

# Run the specific migration
supabase db push
```

This will apply all pending migrations including the AI assistant tables.

### Option 2: Run Migration Manually in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the ENTIRE contents of this file:
   - `supabase/migrations/20260221_ai_property_assistant_setup.sql`
5. Paste into the SQL editor
6. Click "Run"

### Option 3: Check First, Then Deploy

First, check if tables exist:

```bash
# Run this in Supabase SQL Editor
```

Copy contents of `check_ai_tables.sql` and run it.

If you see "❌ MISSING" for any tables, you need to deploy the migration.

## After Deployment

Once the migration is deployed:

1. Refresh your browser
2. The error should disappear
3. Upload a document to test
4. The AI badge should appear on property cards
5. The floating AI button should work

## Verification

After deployment, run this query to verify:

```sql
-- Should return 3 rows with "✅ EXISTS"
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('property_document_embeddings'),
    ('ai_property_conversations'),
    ('property_document_processing_status')
) AS t(table_name);
```

## What These Tables Do

1. **property_document_embeddings**: Stores vector embeddings of document chunks for AI search
2. **ai_property_conversations**: Stores chat history between buyers and AI
3. **property_document_processing_status**: Tracks which documents have been processed

## Need Help?

If you get errors during deployment, share the error message and I'll help fix it.
