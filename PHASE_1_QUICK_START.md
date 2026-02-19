# Phase 1 - Quick Start Guide

## 🚀 What You Need to Do Now

### 1. Apply Database Migrations (5 minutes)

Open your Supabase Dashboard and run these SQL files:

**First Migration - Storage Setup:**
```
File: supabase/migrations/20250219_setup_tenant_documents_storage.sql
```
This creates the storage bucket for documents.

**Second Migration - Add Columns:**
```
File: supabase/migrations/20250219_add_document_columns_to_tenant_profiles.sql
```
This adds the new columns to tenant_profiles table.

### 2. Verify Everything Works (2 minutes)

1. Go to Supabase Dashboard → Storage
   - ✅ You should see `tenant-documents` bucket

2. Go to Supabase Dashboard → Table Editor → tenant_profiles
   - ✅ You should see these new columns:
     - reference_letters
     - employment_letter
     - credit_score_report
     - additional_documents
     - monthly_income
     - emergency_contact_name
     - emergency_contact_phone
     - emergency_contact_relationship

### 3. Test the Profile Page (5 minutes)

1. Start your dev server (if not running):
   ```bash
   npm run dev
   ```

2. Navigate to: `/dashboard/profile`

3. Scroll to the bottom - you should see:
   - "Documents & Financial Information" section (purple/indigo header)
   - Monthly Income field
   - Emergency Contact fields
   - 4 document upload fields

4. Try uploading a test document:
   - Click "Choose File" on any document field
   - Select a PDF, JPG, or PNG (under 10MB)
   - Wait for upload to complete
   - You should see the file name with View/Download/Delete buttons

5. Test the buttons:
   - Click "View" (👁️) - should open document in new tab
   - Click "Download" (⬇️) - should download the file
   - Click "Delete" (❌) - should remove the document

### 4. Verify Data is Saved

1. Fill in some fields:
   - Monthly Income: 5000
   - Emergency Contact Name: John Doe
   - Emergency Contact Phone: +1 555-123-4567
   - Emergency Contact Relationship: Brother

2. Click "Save Profile"

3. Refresh the page

4. ✅ All fields should still have your data

---

## ✅ Success Criteria

You're ready for Phase 2 when:

- [ ] Storage bucket exists
- [ ] New columns exist in database
- [ ] Profile page loads without errors
- [ ] Can upload documents
- [ ] Can view/download/delete documents
- [ ] Monthly income saves correctly
- [ ] Emergency contact saves correctly
- [ ] No console errors

---

## ❌ If Something Goes Wrong

### Error: "Bucket not found"
**Solution:** Run the first migration again (storage setup)

### Error: "Column does not exist"
**Solution:** Run the second migration again (add columns)

### Error: "File too large"
**Solution:** File must be under 10MB

### Error: "Invalid file type"
**Solution:** Only PDF, JPG, PNG, DOC, DOCX allowed

### Documents won't upload
**Solution:** 
1. Check browser console for errors
2. Verify you're logged in
3. Check Supabase Storage policies are correct

---

## 🎯 What's Next?

Once everything above works:

**Phase 2 Preview:**
- Add "Quick Apply" button to property pages
- Create simple application confirmation modal
- Pull data from profile instead of asking again
- Keep old form as backup

**DO NOT start Phase 2 until Phase 1 is fully tested!**

---

## 📁 Files Changed

**New Files:**
- `supabase/migrations/20250219_setup_tenant_documents_storage.sql`
- `supabase/migrations/20250219_add_document_columns_to_tenant_profiles.sql`
- `src/components/profile/DocumentUploadField.tsx`
- `src/services/documentUploadService.ts`

**Updated Files:**
- `src/pages/dashboard/SeekerProfile.tsx`

**No Breaking Changes:**
- ✅ Old application flow still works
- ✅ Existing features unchanged
- ✅ Safe to deploy

---

## Need Help?

Check `PHASE_1_IMPLEMENTATION_COMPLETE.md` for detailed documentation.
