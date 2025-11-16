# Renovation Partners Database Setup Instructions

## 📋 Overview

This guide will help you set up the complete database structure, RLS policies, and storage bucket for the Renovation Partners feature.

## 🚀 Quick Start

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Complete Setup Script**
   - Open the file: `setup_renovation_partners_complete.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)

3. **Verify Setup**
   - Check the verification queries at the end of the script
   - You should see:
     - ✅ Table structure with all columns including `website_url`
     - ✅ RLS enabled on `renovation_partners` table
     - ✅ 3 table policies (Admin, Landlord, Public)
     - ✅ Storage bucket `renovation-partner-images` created
     - ✅ 4 storage policies (Public view, Admin upload/update/delete)

## 📊 What Gets Created

### Database Table
- **Table**: `renovation_partners`
- **Columns**: All required fields including new `website_url` column
- **Indexes**: 6 indexes for optimal query performance
- **Triggers**: Auto-update `updated_at` timestamp

### Row Level Security (RLS) Policies
1. **Admins can manage renovation partners**
   - Full CRUD access (INSERT, UPDATE, DELETE, SELECT)
   - Only users with `role = 'admin'` in user metadata

2. **Landlords can view active renovation partners**
   - Read-only access to active partners
   - Only users with `role = 'landlord'` in user metadata

3. **Public can view active renovation partners**
   - Read-only access for non-authenticated users
   - Only shows `is_active = true` partners

### Storage Bucket
- **Bucket ID**: `renovation-partner-images`
- **Public**: Yes (for easy image access)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WebP, GIF

### Storage Policies
1. **Public can view** - Anyone can view images
2. **Admins can upload** - Only admins can upload
3. **Admins can update** - Only admins can update
4. **Admins can delete** - Only admins can delete

## ✅ Verification Checklist

After running the script, verify:

- [ ] Table `renovation_partners` exists
- [ ] Column `website_url` exists in the table
- [ ] RLS is enabled on the table
- [ ] 3 table policies are created
- [ ] Storage bucket `renovation-partner-images` exists
- [ ] 4 storage policies are created
- [ ] All verification queries return expected results

## 🔧 Troubleshooting

### If you get "relation already exists" error:
- The table already exists - this is fine, the script uses `IF NOT EXISTS`
- Continue running the script

### If you get "policy already exists" error:
- The script drops existing policies first, so this shouldn't happen
- If it does, manually drop the policy and re-run

### If storage bucket creation fails:
- Check if you have storage enabled in your Supabase project
- Verify you have the necessary permissions

### If RLS policies don't work:
- Verify user roles are set correctly in `auth.users.raw_user_meta_data`
- Check that RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'renovation_partners';`

## 📝 User Role Setup

For RLS policies to work, users must have their role set in user metadata:

```sql
-- Set user as admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE id = 'user-id-here';

-- Set user as landlord
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'landlord')
WHERE id = 'user-id-here';
```

## 🎯 Next Steps

After running the setup:
1. Test creating a renovation partner in the admin dashboard
2. Test uploading an image
3. Verify landlords can view active partners
4. Test the "View Listing" and "View Website" buttons

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs
2. Verify all SQL executed successfully
3. Check the verification queries output
4. Ensure user roles are properly configured

