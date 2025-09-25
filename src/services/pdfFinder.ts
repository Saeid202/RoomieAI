import { supabase } from "@/integrations/supabase/client";

export interface PdfLocation {
  bucket: string;
  path: string;
  publicUrl: string;
  size?: number;
}

/**
 * Find PDF files in all storage buckets
 */
export async function findPdfFiles(): Promise<PdfLocation[]> {
  console.log("🔍 Searching for PDF files in all storage buckets...");
  
  const pdfLocations: PdfLocation[] = [];
  
  try {
    // List all storage buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError);
      return pdfLocations;
    }
    
    if (!buckets || buckets.length === 0) {
      console.error("❌ No storage buckets found!");
      return pdfLocations;
    }
    
    console.log("✅ Found buckets:", buckets.map(b => b.id));
    
    // Search each bucket for PDF files
    for (const bucket of buckets) {
      console.log(`\n🔍 Searching bucket: ${bucket.id}`);
      
      try {
        // Search root folder
        const { data: rootFiles } = await supabase.storage.from(bucket.id).list('');
        if (rootFiles) {
          const pdfFiles = rootFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
          for (const pdfFile of pdfFiles) {
            const path = pdfFile.name;
            const { data: { publicUrl } } = supabase.storage.from(bucket.id).getPublicUrl(path);
            pdfLocations.push({
              bucket: bucket.id,
              path: path,
              publicUrl: publicUrl,
              size: pdfFile.metadata?.size
            });
            console.log(`✅ Found PDF: ${bucket.id}/${path}`);
          }
        }
        
        // Search common folders
        const folders = ['Ontario', 'templates', 'legal', 'contracts', 'documents', 'files', 'uploads'];
        for (const folder of folders) {
          const { data: folderFiles } = await supabase.storage.from(bucket.id).list(folder);
          if (folderFiles && folderFiles.length > 0) {
            const pdfFiles = folderFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
            for (const pdfFile of pdfFiles) {
              const path = `${folder}/${pdfFile.name}`;
              const { data: { publicUrl } } = supabase.storage.from(bucket.id).getPublicUrl(path);
              pdfLocations.push({
                bucket: bucket.id,
                path: path,
                publicUrl: publicUrl,
                size: pdfFile.metadata?.size
              });
              console.log(`✅ Found PDF: ${bucket.id}/${path}`);
            }
          }
        }
        
      } catch (error) {
        console.error(`Error searching bucket ${bucket.id}:`, error);
      }
    }
    
    console.log(`\n🎉 Found ${pdfLocations.length} PDF files total`);
    return pdfLocations;
    
  } catch (error) {
    console.error("Error finding PDF files:", error);
    return pdfLocations;
  }
}

/**
 * Find the best PDF to use for lease contracts
 */
export async function findBestLeasePdf(): Promise<PdfLocation | null> {
  const pdfFiles = await findPdfFiles();
  
  if (pdfFiles.length === 0) {
    console.error("❌ No PDF files found in any bucket");
    return null;
  }
  
  // Look for specific lease contract PDFs first
  const leasePdfs = pdfFiles.filter(pdf => 
    pdf.path.toLowerCase().includes('lease') ||
    pdf.path.toLowerCase().includes('contract') ||
    pdf.path.toLowerCase().includes('2229e') ||
    pdf.path.toLowerCase().includes('standard')
  );
  
  if (leasePdfs.length > 0) {
    console.log("✅ Found lease-specific PDF:", leasePdfs[0]);
    return leasePdfs[0];
  }
  
  // Fallback to any PDF
  console.log("✅ Using first available PDF:", pdfFiles[0]);
  return pdfFiles[0];
}

/**
 * Test if a PDF location is accessible
 */
export async function testPdfAccess(location: PdfLocation): Promise<boolean> {
  try {
    console.log(`Testing access to ${location.bucket}/${location.path}...`);
    
    // Test direct download
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from(location.bucket)
      .download(location.path);
    
    if (pdfError) {
      console.error(`❌ Direct download failed:`, pdfError.message);
      return false;
    }
    
    if (!pdfData) {
      console.error(`❌ No data received`);
      return false;
    }
    
    console.log(`✅ PDF accessible! Size: ${pdfData.size} bytes`);
    
    // Test public URL
    try {
      const response = await fetch(location.publicUrl);
      if (response.ok) {
        console.log(`✅ Public URL accessible: ${response.status}`);
        return true;
      } else {
        console.log(`❌ Public URL failed: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (fetchError) {
      console.error(`❌ Public URL fetch error:`, fetchError);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error testing PDF access:`, error);
    return false;
  }
}

/**
 * Get PDF as Blob from any location
 */
export async function getPdfBlob(location: PdfLocation): Promise<Blob> {
  console.log(`Getting PDF from ${location.bucket}/${location.path}...`);
  
  const { data: pdfData, error: pdfError } = await supabase.storage
    .from(location.bucket)
    .download(location.path);
  
  if (pdfError) {
    throw new Error(`Failed to download PDF: ${pdfError.message}`);
  }
  
  if (!pdfData) {
    throw new Error('No PDF data received');
  }
  
  const arrayBuffer = await pdfData.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}
