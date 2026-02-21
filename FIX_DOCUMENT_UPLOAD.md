# Document Upload Issue - Investigation & Fix

## Problem
Property documents are not being uploaded to Supabase storage or saved to the database.

## Potential Issues

### 1. Bucket Name Mismatch
- Code uses: `'property-documents'` (hyphen)
- Database might have: `'property_documents'` (underscore)

### 2. Missing RLS Policies
- Users might not have permission to insert into `property_documents` table
- Users might not have permission to upload to storage bucket

### 3. Missing Table or Bucket
- `property_documents` table might not exist
- `property-documents` bucket might not exist

## Debugging Steps

### Step 1: Run the debug SQL
Run `debug_document_upload.sql` in Supabase SQL Editor to check:
- If bucket exists
- Table structure
- RLS policies
- Existing documents

### Step 2: Check Browser Console
When uploading a document, check for:
- Network errors (403, 404, 500)
- JavaScript errors
- Console logs from the upload function

### Step 3: Check Supabase Logs
In Supabase Dashboard:
1. Go to Logs
2. Filter by "Storage" and "Database"
3. Look for errors during upload attempts

## Quick Fix

If the issue is the bucket name, we need to either:
1. Rename the bucket in Supabase to match the code
2. Update the code to match the bucket name in Supabase

Let me know what you find in the console when you try to upload!
