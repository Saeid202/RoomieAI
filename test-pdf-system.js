// Test script to verify PDF system setup
// Run this in browser console to test the PDF system

console.log("=== PDF SYSTEM TEST SCRIPT ===");

// Test 1: Check if debug function is available
if (typeof window.debugPdfSystem === 'function') {
  console.log("✅ Debug function is available");
} else {
  console.log("❌ Debug function not found - make sure you're on the rental application page");
}

// Test 2: Check if we can access the lease contract service
if (typeof window.LeaseContractService !== 'undefined') {
  console.log("✅ Lease contract service is available");
} else {
  console.log("❌ Lease contract service not found");
}

// Test 3: Manual storage test
async function testStorageManually() {
  try {
    console.log("Testing storage access manually...");
    
    // This assumes Supabase is available globally
    if (typeof window.supabase !== 'undefined') {
      const { data: buckets, error } = await window.supabase.storage.listBuckets();
      console.log("Storage buckets:", buckets);
      console.log("Error:", error);
      
      if (buckets) {
        const legalTemplates = buckets.find(b => b.id === 'legal-templates');
        if (legalTemplates) {
          console.log("✅ legal-templates bucket found:", legalTemplates);
        } else {
          console.log("❌ legal-templates bucket not found");
        }
      }
    } else {
      console.log("❌ Supabase client not available globally");
    }
  } catch (error) {
    console.error("Manual storage test error:", error);
  }
}

// Run the manual test
testStorageManually();

console.log("=== TEST SCRIPT COMPLETE ===");
console.log("To run the full debug, click the 'Debug PDF' button on the rental application page");
