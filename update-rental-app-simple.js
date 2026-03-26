// Add this import at the top of RentalApplication.tsx
import { simplePdfTest, getPdfDirect } from "@/services/simplePdfTest";

// Replace the loadContractPdf function with this simple version:
const loadContractPdf = async () => {
  if (pdfUrl) return; // Don't reload if already loaded
  
  setPdfLoading(true);
  try {
    console.log("=== SIMPLE PDF TEST ===");
    await simplePdfTest();
    
    // For now, let's try to get PDF from the most common bucket names
    const commonBuckets = ['legal-templates', 'rental-documents', 'property-images', 'documents'];
    
    for (const bucketId of commonBuckets) {
      try {
        console.log(`Trying bucket: ${bucketId}`);
        const pdfBlob = await getPdfDirect(bucketId, 'Ontario/2229e_standard-lease_static.pdf');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        toast.success(`PDF loaded from ${bucketId}!`);
        return;
      } catch (error) {
        console.log(`Failed to load from ${bucketId}:`, error.message);
        continue;
      }
    }
    
    toast.error("Could not find PDF in any common bucket. Check console for details.");
    
  } catch (error) {
    console.error("Error loading contract PDF:", error);
    toast.error("Failed to load contract PDF. Check console for details.");
  } finally {
    setPdfLoading(false);
  }
};
