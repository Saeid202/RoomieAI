# Fix Missing Properties Issue

## Problem
Your existing properties aren't showing up because they don't have a `status` field yet. The new property archiving system requires this field.

## Solution
You need to run a database migration to add the status field and set your existing properties to 'active'.

## Option 1: Quick Fix (Recommended)
Run this simple SQL script in your Supabase SQL Editor:

```sql
UPDATE properties 
SET status = 'active' 
WHERE status IS NULL;
```

## Option 2: Full Migration
Run the complete migration file: `supabase/migrations/20250219_add_property_archiving_fields.sql`

This will:
- Add the `status` column
- Add archiving-related columns (`archived_at`, `archive_reason`, etc.)
- Set all existing properties to 'active' status

## Steps to Run in Supabase:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL from Option 1 (or the full migration file)
5. Click "Run" or press Ctrl+Enter
6. Refresh your Properties page

## After Running the Migration
Your 2 rental properties should appear immediately in the "Rentals" tab.

## What This System Does
- **Active properties**: Show in rental listings and your Properties page
- **Archived properties**: Hidden from listings, shown in "Archived" tab
- **Auto-archiving**: When you sign a lease contract, the property automatically archives
- **Re-listing**: You can re-list archived properties when the lease ends
