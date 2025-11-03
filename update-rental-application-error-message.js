// Update the error message in RentalApplication.tsx
// Replace the loadContractPdf function with this improved version:

const loadContractPdf = async () => {
  if (pdfUrl) return; // Don't reload if already loaded
  
  setPdfLoading(true);
  try {
    console.log("=== TESTING PDF EXISTENCE ===");
    const pdfExists = await testPdfExists();
    console.log("PDF exists in storage:", pdfExists);
    
    if (!pdfExists) {
      toast.error("No PDF files found. The system will search all storage buckets for PDF files.");
      console.error("❌ No PDF files found in any bucket.");
      console.error("Please upload a PDF file to any storage bucket in Supabase.");
      return;
    }
    
    console.log("=== LOADING PDF ===");
    // Load template PDF - works with or without application ID
    const url = await getContractPdfUrl(createdApplicationId);
    setPdfUrl(url);
    toast.success("Contract PDF loaded successfully!");
  } catch (error) {
    console.error("Error loading contract PDF:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('No PDF files found')) {
      toast.error("No PDF files found in any storage bucket. Please upload a PDF file to Supabase Storage.");
    } else if (errorMessage.includes('not accessible')) {
      toast.error("PDF file found but not accessible. Please check storage permissions.");
    } else {
      toast.error(`Failed to load contract PDF: ${errorMessage}`);
    }
  } finally {
    setPdfLoading(false);
  }
};
