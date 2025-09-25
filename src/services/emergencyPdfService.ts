import { supabase } from "@/integrations/supabase/client";

/**
 * Emergency PDF service - very simple and direct
 */
export async function getEmergencyPdf(): Promise<{ url: string; bucket: string; path: string } | null> {
  console.log("🚨 EMERGENCY PDF LOADER - Finding your PDF...");
  
  try {
    // Step 1: List all buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error("❌ Cannot list buckets:", bucketError);
      return null;
    }
    
    if (!buckets || buckets.length === 0) {
      console.error("❌ No buckets found!");
      return null;
    }
    
    console.log("✅ Available buckets:", buckets.map(b => b.id));
    
    // Step 2: Check each bucket for Ontario folder
    for (const bucket of buckets) {
      console.log(`🔍 Checking bucket: ${bucket.id}`);
      
      try {
        // List Ontario folder
        const { data: ontarioFiles, error: ontarioError } = await supabase.storage
          .from(bucket.id)
          .list('Ontario');
        
        if (ontarioError) {
          console.log(`  No Ontario folder in ${bucket.id}`);
          continue;
        }
        
        if (!ontarioFiles || ontarioFiles.length === 0) {
          console.log(`  Ontario folder empty in ${bucket.id}`);
          continue;
        }
        
        console.log(`  ✅ Found files in Ontario:`, ontarioFiles.map(f => f.name));
        
        // Look for any PDF file
        const pdfFiles = ontarioFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        
        if (pdfFiles.length === 0) {
          console.log(`  No PDF files in Ontario folder of ${bucket.id}`);
          continue;
        }
        
        // Use the first PDF found
        const pdfFile = pdfFiles[0];
        const pdfPath = `Ontario/${pdfFile.name}`;
        
        console.log(`  🎯 Found PDF: ${pdfFile.name}`);
        
        // Test if we can access it
        const { data: pdfData, error: pdfError } = await supabase.storage
          .from(bucket.id)
          .download(pdfPath);
        
        if (pdfError) {
          console.error(`  ❌ Cannot download: ${pdfError.message}`);
          continue;
        }
        
        if (!pdfData) {
          console.error(`  ❌ No data received`);
          continue;
        }
        
        console.log(`  ✅ PDF accessible! Size: ${pdfData.size} bytes`);
        
        // Create object URL
        const arrayBuffer = await pdfData.arrayBuffer();
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        
        console.log(`  🎉 SUCCESS! PDF loaded from ${bucket.id}/${pdfPath}`);
        
        return {
          url: url,
          bucket: bucket.id,
          path: pdfPath
        };
        
      } catch (error) {
        console.error(`  Error checking bucket ${bucket.id}:`, error);
        continue;
      }
    }
    
    console.error("❌ No accessible PDF found in any Ontario folder");
    return null;
    
  } catch (error) {
    console.error("❌ Emergency PDF loader failed:", error);
    return null;
  }
}

/**
 * Simple test function
 */
export async function testEmergencyPdf(): Promise<void> {
  console.log("=== EMERGENCY PDF TEST ===");
  
  const result = await getEmergencyPdf();
  
  if (result) {
    console.log("✅ SUCCESS!");
    console.log("Bucket:", result.bucket);
    console.log("Path:", result.path);
    console.log("URL:", result.url);
  } else {
    console.log("❌ FAILED!");
    console.log("No PDF found in any Ontario folder");
  }
}
