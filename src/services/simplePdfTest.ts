import { supabase } from "@/integrations/supabase/client";

/**
 * Very simple test to find your PDF
 */
export async function simplePdfTest(): Promise<void> {
  console.log("=== SIMPLE PDF TEST ===");
  
  try {
    // Test 1: Check if we can access Supabase at all
    console.log("1. Testing Supabase connection...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("User:", user ? "Logged in" : "Not logged in");
    console.log("Auth error:", authError);
    
    // Test 2: Try to list buckets
    console.log("2. Testing storage access...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets);
    console.log("Bucket error:", bucketError);
    
    if (bucketError) {
      console.error("❌ Cannot access storage:", bucketError);
      return;
    }
    
    if (!buckets || buckets.length === 0) {
      console.error("❌ No buckets found");
      return;
    }
    
    console.log("✅ Found buckets:", buckets.map(b => b.id));
    
    // Test 3: Check each bucket for Ontario folder
    for (const bucket of buckets) {
      console.log(`\n3. Checking bucket: ${bucket.id}`);
      
      // Try to list Ontario folder
      const { data: ontarioFiles, error: ontarioError } = await supabase.storage
        .from(bucket.id)
        .list('Ontario');
      
      console.log("Ontario files:", ontarioFiles);
      console.log("Ontario error:", ontarioError);
      
      if (ontarioError) {
        console.log(`No Ontario folder in ${bucket.id}`);
        continue;
      }
      
      if (ontarioFiles && ontarioFiles.length > 0) {
        console.log(`✅ Found files in Ontario folder of ${bucket.id}:`, ontarioFiles.map(f => f.name));
        
        // Look for PDF files
        const pdfFiles = ontarioFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFiles.length > 0) {
          console.log(`✅ Found PDF files:`, pdfFiles.map(f => f.name));
          
          // Try to download the first PDF
          const firstPdf = pdfFiles[0];
          const pdfPath = `Ontario/${firstPdf.name}`;
          console.log(`Trying to download: ${bucket.id}/${pdfPath}`);
          
          const { data: pdfData, error: pdfError } = await supabase.storage
            .from(bucket.id)
            .download(pdfPath);
          
          if (pdfError) {
            console.error(`❌ Cannot download PDF:`, pdfError);
          } else {
            console.log(`✅ PDF downloaded successfully! Size: ${pdfData.size} bytes`);
            
            // Test public URL
            const { data: { publicUrl } } = supabase.storage
              .from(bucket.id)
              .getPublicUrl(pdfPath);
            console.log(`Public URL: ${publicUrl}`);
            
            // Test if public URL works
            try {
              const response = await fetch(publicUrl);
              console.log(`Public URL test: ${response.status} ${response.statusText}`);
            } catch (fetchError) {
              console.error(`Public URL fetch error:`, fetchError);
            }
          }
        } else {
          console.log(`No PDF files found in Ontario folder of ${bucket.id}`);
        }
      }
    }
    
    console.log("\n=== SIMPLE TEST COMPLETE ===");
    
  } catch (error) {
    console.error("Simple test error:", error);
  }
}

/**
 * Get PDF directly from a specific bucket and path
 */
export async function getPdfDirect(bucketId: string, filePath: string): Promise<Blob> {
  console.log(`Getting PDF from ${bucketId}/${filePath}...`);
  
  const { data: pdfData, error: pdfError } = await supabase.storage
    .from(bucketId)
    .download(filePath);
  
  if (pdfError) {
    throw new Error(`Failed to download PDF: ${pdfError.message}`);
  }
  
  if (!pdfData) {
    throw new Error('No PDF data received');
  }
  
  const arrayBuffer = await pdfData.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}
