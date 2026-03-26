// Quick Document Upload Diagnostic
// Run this in your browser console to check the current state

console.log('🔍 Quick Document Upload Diagnostic...');

async function quickDiagnostic() {
  try {
    // Check 1: Supabase client
    console.log('1️⃣ Supabase client:', window.supabase ? '✅ Available' : '❌ Missing');
    
    // Check 2: Authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    console.log('2️⃣ Authentication:', user ? `✅ Logged in as ${user.id}` : '❌ Not authenticated');
    
    if (!user) return;
    
    // Check 3: Applications
    const { data: applications, error: appError } = await window.supabase
      .from('rental_applications')
      .select('id, full_name, status')
      .eq('applicant_id', user.id)
      .limit(1);
    
    console.log('3️⃣ Applications:', applications?.length > 0 ? `✅ ${applications.length} found` : '❌ None found');
    
    if (applications?.length === 0) {
      console.log('💡 You need to create a rental application first');
      return;
    }
    
    // Check 4: Storage bucket
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    const rentalBucket = buckets?.find(b => b.name === 'rental-documents');
    console.log('4️⃣ Storage bucket:', rentalBucket ? '✅ rental-documents exists' : '❌ Missing');
    
    // Check 5: Database table
    const { data: docs, error: docsError } = await window.supabase
      .from('rental_documents')
      .select('id')
      .limit(1);
    
    console.log('5️⃣ Database table:', docsError ? `❌ Error: ${docsError.message}` : '✅ rental_documents accessible');
    
    // Check 6: Current documents
    if (applications?.length > 0) {
      const appId = applications[0].id;
      const { data: existingDocs, error: existingError } = await window.supabase
        .from('rental_documents')
        .select('id, document_type, original_filename, status')
        .eq('application_id', appId);
      
      console.log('6️⃣ Existing documents:', existingDocs?.length || 0, 'found');
      if (existingDocs?.length > 0) {
        console.log('📄 Documents:', existingDocs);
      }
    }
    
    console.log('🏁 Diagnostic complete');
    
  } catch (error) {
    console.log('❌ Diagnostic failed:', error);
  }
}

quickDiagnostic();
