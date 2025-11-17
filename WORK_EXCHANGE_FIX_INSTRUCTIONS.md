# Work Exchange Form Submission Fix

## Issues
The work exchange form submission was failing due to two problems:

1. **Missing Columns**: The `work_exchange_offers` table was missing many required columns. The current table only had:
   - `id`, `title`, `description`, `property_id`, `status`
   
   But the application code expects:
   - `user_id`, `user_name`, `user_email`, `space_type`, `work_requested`, `duration`, `work_hours_per_week`, `address`, `city`, `state`, `zip_code`, `amenities_provided`, `additional_notes`, `images`, `contact_preference`, `created_at`, `updated_at`

2. **RLS Policy Violation**: After adding columns, you may encounter a `403 (Forbidden)` error with message "new row violates row-level security policy". This means the Row-Level Security policies need to be fixed.

## Solution

### Step 1: Run the SQL Fix Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `fix_work_exchange_table_complete.sql`
4. Click **Run** to execute the script

This will:
- Add all missing columns required by the application:
  - User information: `user_id`, `user_name`, `user_email`
  - Space information: `space_type`, `work_requested`, `duration`, `work_hours_per_week`
  - Location: `address`, `city`, `state`, `zip_code`
  - Additional: `amenities_provided`, `additional_notes`, `images`, `contact_preference`
  - Timestamps: `created_at`, `updated_at`
- Create indexes for better performance
- Refresh the schema cache so Supabase recognizes the new columns

### Step 2: Fix RLS Policies (If you get 403 Forbidden error)

If you encounter a `403 (Forbidden)` error with message "new row violates row-level security policy", you need to fix the RLS policies:

1. In Supabase SQL Editor, copy and paste the contents of `fix_work_exchange_rls_policies.sql`
2. Click **Run** to execute the script
3. This will recreate all RLS policies to allow authenticated users to create their own offers

### Step 3: Verify the Fix

After running both SQL scripts, try submitting the work exchange form again. It should now work correctly.

## What Was Fixed

### Code Changes:
- Updated `src/services/workExchangeServiceSimple.ts` to properly handle `additional_notes` field
- Added proper null handling for optional fields
- Ensured all required fields are included in the submission

### Database Changes:
- **Column Fix (`fix_work_exchange_table_complete.sql`)**:
  - Added all missing columns to `work_exchange_offers` table:
    - User fields: `user_id`, `user_name`, `user_email`
    - Space fields: `space_type`, `work_requested`, `duration`, `work_hours_per_week`
    - Location fields: `address`, `city`, `state`, `zip_code`
    - Additional fields: `amenities_provided` (TEXT[]), `additional_notes` (TEXT), `images` (TEXT[]), `contact_preference` (TEXT)
    - Timestamp fields: `created_at`, `updated_at`
  - Created indexes for better query performance
  - All columns are nullable or have defaults to allow existing data to remain valid

- **RLS Policy Fix (`fix_work_exchange_rls_policies.sql`)**:
  - Recreated all Row-Level Security policies
  - Fixed INSERT policy to allow authenticated users to create their own offers
  - Ensured proper permissions for SELECT, INSERT, UPDATE, and DELETE operations

## Testing

After running the SQL script:
1. Go to `/dashboard/work-exchange`
2. Fill out the work exchange form
3. Click "Submit" or "Create Offer"
4. The form should submit successfully without errors

## Notes

- The `additional_notes` field is optional - it can be null or empty
- If you still see errors, try refreshing your browser to clear any cached schema
- The schema cache refresh (`NOTIFY pgrst, 'reload schema'`) helps Supabase recognize new columns immediately

