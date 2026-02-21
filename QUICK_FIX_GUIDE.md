# 🚀 Quick Fix Guide - Property Documents "Bucket not found" Error

## The Problem
When you click "View" on a property document, you get this error:
```json
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

## The Cause
Your `property-documents` storage bucket is set to PRIVATE, but the app tries to access it with public URLs.

## The Fix (Takes 2 Minutes!)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/storage/buckets

### Step 2: Find Your Bucket
Look for "property-documents" in the list of buckets

### Step 3: Edit the Bucket
1. Click the three dots (⋮) next to "property-documents"
2. Click "Edit bucket"

### Step 4: Make it Public
1. Find the "Public bucket" toggle
2. Turn it ON (should turn green/blue)
3. Click "Save"

### Step 5: Verify It Worked
Run this SQL in your Supabase SQL Editor:
```sql
SELECT name, public FROM storage.buckets WHERE name = 'property-documents';
```

You should see:
```
name: property-documents
public: true  ← Should be TRUE now!
```

### Step 6: Test It
1. Go to your app: http://localhost:5173
2. Log in as property owner: info@cargoplus.site
3. Go to any property with documents
4. Click "View All Documents"
5. Click "View" on a document
6. It should open in a new tab WITHOUT the "Bucket not found" error! 🎉

## Alternative: Automatic Fix (If Dashboard Doesn't Work)

If you can't access the dashboard or prefer a code solution:

1. Open your app in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Paste this and press Enter:
```javascript
import('./src/utils/fixBucketPublic.ts').then(m => m.fixPropertyDocumentsBucket())
```

5. Watch the console output - it will tell you if it worked or if you need to use the dashboard

## What Changed in the Code

I've updated the code to:
1. ✅ Automatically detect when bucket is private
2. ✅ Attempt to make it public automatically
3. ✅ Show clear instructions if manual fix is needed
4. ✅ Better logging to help debug issues
5. ✅ Regenerate URLs with correct bucket name

## Still Having Issues?

If documents still don't work after making the bucket public:

1. Check if storage policies exist:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'property-documents';
```

2. If no policies, you may need to add them (see `fix_property_documents_bucket_public.sql`)

3. Check browser console for any new error messages

4. Verify documents are actually in storage:
```sql
SELECT file_url FROM property_documents WHERE property_id = '88f6d735-4d0a-4788-8589-44bc3fa646fe';
```

## Summary

✅ Documents ARE uploading correctly
✅ Documents ARE in storage and database
❌ Bucket is PRIVATE (needs to be PUBLIC)
🔧 Fix: Make bucket public in Supabase Dashboard

That's it! Once the bucket is public, everything should work perfectly.
