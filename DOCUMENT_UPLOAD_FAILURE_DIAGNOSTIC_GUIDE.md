# Document Upload Failure Diagnostic Guide

## Problem
Users upload documents during rental application, but documents are NOT saved to:
1. Supabase Storage (`rental-documents` bucket)
2. Database (`rental_documents` table)

## Quick Diagnostic Steps

### Step 1: Run SQL Diagnostic
1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** `diagnose-document-upload-failure.sql`
3. **Click "Run"**
4. **Review the results** - look for ❌ marks

### Step 2: Run Browser Console Test
1. **Open your application** in browser
2. **Go to rental application page** (where documents are uploaded)
3. **Open browser console** (F12)
4. **Copy and paste** `test-document-upload-debug.js`
5. **Press Enter** to run the test
6. **Review the detailed results**

### Step 3: Try Uploading a Document
1. **Fill out the rental application form**
2. **Select some documents** to upload
3. **Click "Save & Submit Documents for Review"**
4. **Watch the browser console** for detailed logs
5. **Look for error messages** in red

## Common Issues and Fixes

### Issue 1: Storage Bucket Missing
**Symptoms:**
- Console shows: "Bucket rental-documents not found"
- SQL diagnostic shows: ❌ Bucket missing

**Fix:**
```sql
-- Run this in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
```

### Issue 2: Database Table Missing
**Symptoms:**
- Console shows: "relation rental_documents does not exist"
- SQL diagnostic shows: ❌ Table missing

**Fix:**
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.rental_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('reference', 'employment', 'credit', 'additional')),
    original_filename VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Issue 3: RLS Policies Missing
**Symptoms:**
- Console shows: "new row violates row-level security policy"
- Upload fails with permission errors

**Fix:**
```sql
-- Run this in Supabase SQL Editor
-- Enable RLS
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own documents" ON public.rental_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own documents" ON public.rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );
```

### Issue 4: Storage Policies Missing
**Symptoms:**
- Storage upload fails with policy errors
- Console shows storage permission denied

**Fix:**
```sql
-- Run this in Supabase SQL Editor
CREATE POLICY "Users can upload rental documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own rental documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'rental-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Issue 5: Application Not Created
**Symptoms:**
- Console shows: "Application not found"
- Foreign key constraint errors

**Fix:**
- Ensure the rental application is created BEFORE uploading documents
- Check that `appId` is valid in the upload process

## Complete Fix Script

If you want to fix everything at once, run `fix-rental-documents-complete.sql` in Supabase SQL Editor.

## Testing After Fix

1. **Run the SQL diagnostic again** to verify all components exist
2. **Run the browser console test** to verify functionality
3. **Try uploading a document** in the rental application form
4. **Check Supabase Storage** dashboard for uploaded files
5. **Check Supabase Database** for document records

## Expected Results After Fix

✅ **Storage bucket exists** with correct configuration
✅ **Database table exists** with proper schema
✅ **RLS policies allow** document uploads
✅ **Storage policies allow** file uploads
✅ **Documents save to storage** when uploaded
✅ **Document records created** in database
✅ **Documents linked** to rental applications
✅ **Success messages** shown to user
✅ **Error messages** clear and helpful

## Debugging Tips

### Check Browser Console
Look for these specific error patterns:
- `❌ Storage upload error:` - Storage bucket or policy issue
- `❌ Database insert error:` - Database table or RLS policy issue
- `❌ Application not found:` - Application creation issue
- `❌ User not authenticated:` - Authentication issue

### Check Supabase Dashboard
1. **Storage** → **Buckets** → Look for `rental-documents`
2. **Database** → **Tables** → Look for `rental_documents`
3. **Authentication** → **Users** → Verify user is logged in

### Check Network Tab
1. Open browser **Developer Tools** → **Network** tab
2. Try uploading a document
3. Look for failed requests to Supabase
4. Check the error messages in failed requests

## Support

If issues persist after running the fixes:

1. **Check the specific error message** in browser console
2. **Verify all components exist** using the SQL diagnostic
3. **Test with a simple file** (small text file)
4. **Check Supabase project settings** and permissions
5. **Contact support** with the specific error messages

The document upload system should work correctly after applying the appropriate fixes!
