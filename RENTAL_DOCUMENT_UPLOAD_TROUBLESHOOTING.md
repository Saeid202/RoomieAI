# Rental Document Upload Troubleshooting Guide

## 🔍 **Issue: Documents Not Saving to Storage**

### **Root Causes Identified:**

1. **✅ FIXED**: Missing comma in database record (syntax error)
2. **❓ UNKNOWN**: Storage bucket may not exist
3. **❓ UNKNOWN**: Database table may not exist  
4. **❓ UNKNOWN**: RLS policies may be incorrect

## 🛠️ **Step-by-Step Fix**

### **Step 1: Run Storage Setup Script**

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Copy and paste the contents of setup_rental_documents_storage_complete.sql
-- This will create the bucket, table, and all necessary policies
```

### **Step 2: Test the Setup**

**Open browser console (F12) and run:**

```javascript
// Copy and paste the contents of test_rental_document_upload.js
// This will test all components of the upload system
```

### **Step 3: Check Browser Console**

**Look for these specific errors:**

1. **`StorageApiError: new row violates row-level security policy`**
   - **Solution**: RLS policies not set up correctly
   - **Fix**: Run the setup script above

2. **`relation "public.rental_documents" does not exist`**
   - **Solution**: Database table not created
   - **Fix**: Run the setup script above

3. **`bucket "rental-documents" not found`**
   - **Solution**: Storage bucket not created
   - **Fix**: Run the setup script above

4. **`Permission denied`**
   - **Solution**: User not authenticated or RLS policies too restrictive
   - **Fix**: Ensure user is logged in and run setup script

### **Step 4: Manual Verification**

**Check these in Supabase Dashboard:**

1. **Storage > Buckets**
   - Should see `rental-documents` bucket
   - Should be private (not public)

2. **Database > Tables**
   - Should see `rental_documents` table
   - Should have columns: `id`, `application_id`, `document_type`, etc.

3. **Authentication > Users**
   - Should be logged in as a valid user

### **Step 5: Test Document Upload**

1. **Navigate to rental application page**
2. **Fill out the form with required fields**
3. **Upload a test document (PDF, JPG, PNG)**
4. **Check browser console for upload progress**
5. **Check Supabase Dashboard > Storage for uploaded files**

## 🔧 **Common Issues & Solutions**

### **Issue 1: "Storage bucket not found"**
```sql
-- Create the bucket manually
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;
```

### **Issue 2: "Table rental_documents does not exist"**
```sql
-- Create the table manually
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

### **Issue 3: "Permission denied"**
```sql
-- Enable RLS and create policies
ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert documents for own applications" ON public.rental_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_applications 
            WHERE rental_applications.id = rental_documents.application_id 
            AND rental_applications.applicant_id = auth.uid()
        )
    );
```

## 🧪 **Testing Checklist**

- [ ] Storage bucket exists and is accessible
- [ ] Database table exists with correct structure
- [ ] RLS policies are properly configured
- [ ] User is authenticated
- [ ] Document upload shows success message
- [ ] Files appear in Supabase Dashboard > Storage
- [ ] Database records are created in `rental_documents` table
- [ ] Landlord can view uploaded documents

## 📊 **Expected Results**

After successful setup:

1. **Browser Console**: Should show upload progress logs
2. **Supabase Storage**: Should contain uploaded files in `rental-documents` bucket
3. **Database**: Should have records in `rental_documents` table
4. **Landlord Dashboard**: Should display uploaded documents with download buttons

## 🚨 **If Still Not Working**

1. **Check browser console for specific error messages**
2. **Verify all SQL scripts ran successfully**
3. **Test with a small file (under 1MB)**
4. **Try uploading from a different browser/incognito mode**
5. **Check Supabase project settings for any restrictions**

## 📞 **Next Steps**

If the issue persists after following this guide:

1. **Copy the exact error message from browser console**
2. **Check Supabase Dashboard for any error logs**
3. **Verify the setup script ran without errors**
4. **Test with a minimal file upload**

The most common issue is missing RLS policies or the storage bucket not being created properly.
