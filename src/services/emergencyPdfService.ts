import { supabase } from "@/integrations/supabase/client";

/**
 * Emergency PDF service - tries known buckets directly
 */
export async function getEmergencyPdf(): Promise<{ url: string; bucket: string; path: string; publicUrl?: string } | null> {
  console.log("📄 PDF Loader - Searching for Ontario lease contract...");
  
  // Known buckets where the PDF might be
  const possibleBuckets = ['legal-templates', 'rental-documents', 'property-images', 'lease-contracts'];
  
  // Common PDF names for Ontario lease
  const possiblePaths = [
    'Ontario/2229e_standard-lease_static.pdf',
    'Ontario/standard-lease.pdf',
    'Ontario/lease-template.pdf'
  ];
  
  try {
    // Try each bucket + path combination
    for (const bucketId of possibleBuckets) {
      console.log(`🔍 Trying bucket: ${bucketId}`);
      
      for (const pdfPath of possiblePaths) {
        try {
          console.log(`  → Attempting: ${bucketId}/${pdfPath}`);
          
          // Try to download directly
          const { data: pdfData, error: downloadError } = await supabase.storage
            .from(bucketId)
            .download(pdfPath);
          
          if (downloadError) {
            console.log(`    ✗ Not found: ${downloadError.message}`);
            continue;
          }
          
          if (!pdfData || pdfData.size === 0) {
            console.log(`    ✗ Empty file`);
            continue;
          }
          
          console.log(`  ✅ Found PDF! Size: ${pdfData.size} bytes`);
          
          // Create object URL
          const arrayBuffer = await pdfData.arrayBuffer();
          const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          
          console.log(`  🎉 SUCCESS! PDF loaded from ${bucketId}/${pdfPath}`);
          
          // Try to get a public URL (works if bucket/object is public)
          let publicUrl: string | undefined = undefined;
          try {
            const { data: publicData } = supabase.storage
              .from(bucketId)
              .getPublicUrl(pdfPath);
            publicUrl = publicData?.publicUrl;
          } catch (e) {
            // ignore; not all buckets may be public
          }

          return {
            url,
            bucket: bucketId,
            path: pdfPath,
            publicUrl
          };
          
        } catch (error) {
          console.log(`    ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          continue;
        }
      }
    }
    
    console.error("❌ No Ontario lease PDF found in any bucket");
    console.error("📋 Checked buckets:", possibleBuckets.join(', '));
    console.error("📋 Checked paths:", possiblePaths.join(', '));
    console.error("💡 Please upload the Ontario lease PDF to one of these locations");
    return null;
    
  } catch (error) {
    console.error("❌ PDF loader failed:", error);
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
