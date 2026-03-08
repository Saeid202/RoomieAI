// Test payment intent creation directly
// Run this in browser console on your app page

async function testPaymentIntent() {
  console.log('🧪 Testing payment intent creation...');
  
  // Get the Supabase client from window
  const supabase = window.supabase || (await import('./src/integrations/supabase/client.js')).supabase;
  
  // Test data
  const testData = {
    amount: 1000, // $10.00 in cents
    currency: 'cad',
    payment_method_types: ['acss_debit'],
    payment_method: 'pm_test_123', // This will fail but we'll see the error
    metadata: {
      tenant_id: 'test',
      landlord_id: 'test',
      property_id: 'test',
      due_date: '2026-03-15',
      payment_type: 'rent'
    }
  };
  
  console.log('📤 Sending request:', testData);
  
  try {
    const { data, error } = await supabase.functions.invoke('create-pad-payment-intent', {
      body: testData
    });
    
    console.log('📥 Response:', { data, error });
    
    if (error) {
      console.error('❌ Error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    }
    
    if (data) {
      console.log('✅ Success:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
    console.error('❌ Exception details:', JSON.stringify(err, null, 2));
  }
}

// Run the test
testPaymentIntent();
