# Document Upload System Diagnostic - Complete

## Overview
This document provides a comprehensive diagnostic plan for verifying the rental document upload system. The system consists of both Supabase Storage (for files) and Database (for metadata).

## Files Created

### 1. `verify-rental-documents-storage.sql`
**Purpose:** Complete SQL verification script
**Usage:** Run in Supabase SQL Editor to check all components
**Checks:**
- Storage bucket configuration
- Database table structure
- RLS policies
- Existing data

### 2. `test-document-upload-system.js`
**Purpose:** Browser console test script
**Usage:** Copy and paste into browser console on your application
**Tests:**
- User authentication
- Storage bucket access
- Database table access
- Actual file upload test

### 3. `fix-rental-documents-complete.sql`
**Purpose:** Complete fix script for any issues found
**Usage:** Run in Supabase SQL Editor if verification shows problems
**Fixes:**
- Creates storage bucket
- Creates database table
- Sets up RLS policies
- Configures storage policies

## Step-by-Step Diagnostic Process

### Step 1: Run SQL Verification
1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** `verify-rental-documents-storage.sql`
3. **Click "Run"**
4. **Review the results** for any issues

### Step 2: Run Browser Console Test
1. **Open your application** in browser
2. **Go to rental application page** (where documents are uploaded)
3. **Open browser console** (F12)
4. **Copy and paste** `test-document-upload-system.js`
5. **Press Enter** to run the test
6. **Review the test results**

### Step 3: Fix Any Issues Found
If the verification shows problems:
1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** `fix-rental-documents-complete.sql`
3. **Click "Run"**
4. **Re-run the verification** to confirm fixes

## Expected Results

### ✅ Storage Bucket Configuration
- Bucket name: `rental-documents`
- Public: `false` (private for security)
- File size limit: `10485760` (10MB)
- Allowed MIME types: PDF, images, documents

### ✅ Database Table Structure
- Table name: `rental_documents`
- RLS enabled: `true`
- Required fields: id, application_id, document_type, original_filename, storage_url, etc.

### ✅ RLS Policies
- Users can view their own documents
- Users can insert their own documents
- Users can update their own documents
- Users can delete their own documents
- Property owners can view documents for their applications

### ✅ Storage Policies
- Users can upload to their own folders
- Users can view their own files
- Users can update their own files
- Users can delete their own files
- Property owners can view files for their applications

## Common Issues and Solutions

### Issue 1: Storage Bucket Not Found
**Error:** `bucket "rental-documents" not found`
**Solution:** Run `fix-rental-documents-complete.sql`

### Issue 2: Database Table Missing
**Error:** `relation "public.rental_documents" does not exist`
**Solution:** Run `fix-rental-documents-complete.sql`

### Issue 3: RLS Policy Blocking Access
**Error:** `new row violates row-level security policy`
**Solution:** Run `fix-rental-documents-complete.sql`

### Issue 4: Storage Policy Blocking Upload
**Error:** `new row violates row-level security policy` (storage)
**Solution:** Run `fix-rental-documents-complete.sql`

## Testing Checklist

### Storage Verification
- [ ] Bucket `rental-documents` exists
- [ ] Bucket is private (not public)
- [ ] File size limit is 10MB
- [ ] Correct MIME types allowed
- [ ] Storage policies exist

### Database Verification
- [ ] Table `rental_documents` exists
- [ ] Table has correct structure
- [ ] RLS is enabled
- [ ] RLS policies exist
- [ ] Foreign key to rental_applications

### Frontend Verification
- [ ] User authentication works
- [ ] Storage bucket accessible
- [ ] Database table accessible
- [ ] File upload test passes
- [ ] No console errors

### Data Verification
- [ ] Documents appear in storage
- [ ] Document records in database
- [ ] Documents linked to applications
- [ ] Metadata is correct

## Success Criteria

All 4 main verifications must pass:

1. ✅ **Storage bucket properly configured**
   - Bucket exists with correct settings
   - Storage policies allow uploads

2. ✅ **RLS policies allow uploads**
   - Database policies allow inserts
   - Storage policies allow uploads

3. ✅ **Frontend successfully connects**
   - Authentication works
   - Storage access works
   - Database access works
   - Upload test passes

4. ✅ **Documents saved to database**
   - Files appear in storage
   - Records appear in database
   - Documents linked to applications

## Next Steps

After running the diagnostic:

1. **If all tests pass:** Document upload system is working correctly
2. **If tests fail:** Run the fix script and re-test
3. **If issues persist:** Check Supabase project settings and permissions

## Support

If you encounter issues not covered by this diagnostic:

1. Check Supabase Dashboard → Storage → Buckets
2. Check Supabase Dashboard → Database → Tables
3. Check Supabase Dashboard → Authentication → Users
4. Review browser console for detailed error messages
5. Check network tab for failed requests

The document upload system should now be fully functional for rental applications!
