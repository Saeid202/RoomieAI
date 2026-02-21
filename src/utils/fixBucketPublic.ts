// =====================================================
// Fix Property Documents Bucket - Make it Public
// =====================================================
// Run this once in browser console to fix the bucket
// =====================================================

import { supabase } from "@/integrations/supabase/client";

export async function fixPropertyDocumentsBucket() {
  try {
    console.log("🔧 Attempting to fix property-documents bucket...");
    
    // Check current bucket status
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      return;
    }
    
    const bucket = buckets?.find(b => b.id === 'property-documents');
    
    if (!bucket) {
      console.error("❌ Bucket 'property-documents' not found!");
      console.log("Available buckets:", buckets?.map(b => b.id));
      return;
    }
    
    console.log("📊 Current bucket status:", {
      name: bucket.name,
      public: bucket.public,
      id: bucket.id
    });
    
    if (bucket.public) {
      console.log("✅ Bucket is already public!");
      return;
    }
    
    // Try to update bucket to public
    console.log("🔄 Updating bucket to public...");
    const { data, error } = await supabase.storage.updateBucket('property-documents', {
      public: true
    });
    
    if (error) {
      console.error("❌ Error updating bucket:", error);
      console.log("⚠️ You may need to update this in the Supabase Dashboard:");
      console.log("1. Go to Storage > Buckets");
      console.log("2. Click the three dots next to 'property-documents'");
      console.log("3. Click 'Edit bucket'");
      console.log("4. Toggle 'Public bucket' to ON");
      console.log("5. Click 'Save'");
      return;
    }
    
    console.log("✅ Bucket updated successfully!", data);
    
    // Verify the change
    const { data: updatedBuckets } = await supabase.storage.listBuckets();
    const updatedBucket = updatedBuckets?.find(b => b.id === 'property-documents');
    
    console.log("📊 Updated bucket status:", {
      name: updatedBucket?.name,
      public: updatedBucket?.public
    });
    
    if (updatedBucket?.public) {
      console.log("🎉 SUCCESS! Bucket is now public!");
    } else {
      console.log("⚠️ Bucket update may not have taken effect. Try refreshing the page.");
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Auto-run when imported
if (typeof window !== 'undefined') {
  console.log("💡 To fix the bucket, run: fixPropertyDocumentsBucket()");
  // @ts-ignore - expose to window for easy access
  window.fixPropertyDocumentsBucket = fixPropertyDocumentsBucket;
}
