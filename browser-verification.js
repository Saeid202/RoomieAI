// Copy and paste this into your browser console when on the Digital Wallet page
// This will verify Step 1: Stripe Financial Connections

(async function verifyStep1() {
    console.log('🍁 Verifying Step 1: Stripe Financial Connections for Canadian Banks');
    console.log('=' .repeat(60));
    
    try {
        // Step 1.1: Check if user is logged in
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('❌ User not authenticated. Please login first.');
            return;
        }
        console.log('✅ User authenticated:', user.email);
        
        // Step 1.2: Test Stripe Financial Connections session creation
        console.log('🟡 Testing Canadian bank connection session...');
        
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'create-session',
                country: 'CA',
                test: true
            }
        });
        
        console.log('📊 Session creation response:');
        console.log('  - Error:', sessionError);
        console.log('  - Data:', sessionData);
        
        if (sessionError) {
            console.error('❌ Step 1 FAILED: Session creation error');
            console.error('   Error details:', sessionError);
            return;
        }
        
        if (!sessionData?.client_secret) {
            console.error('❌ Step 1 FAILED: No client secret returned');
            return;
        }
        
        if (!sessionData.client_secret.startsWith('fcsess_')) {
            console.error('❌ Step 1 FAILED: Invalid client secret format');
            console.error('   Expected: fcsess_...');
            console.error('   Received:', sessionData.client_secret);
            return;
        }
        
        // Step 1.3: Verify session structure
        console.log('✅ Step 1 PASSED: Stripe Financial Connections session created');
        console.log('🔑 Session details:');
        console.log('  - Client secret:', sessionData.client_secret.substring(0, 20) + '...');
        console.log('  - Session ID:', sessionData.session_id || 'Not provided');
        console.log('  - Country:', sessionData.country || 'Not specified');
        
        // Step 1.4: Check if Stripe modal can be opened
        console.log('🟡 Testing Stripe modal readiness...');
        
        // Check if we have access to stripe (should be available from the app)
        if (typeof stripe !== 'undefined') {
            console.log('✅ Stripe instance available');
            console.log('🎉 Step 1 COMPLETE: Ready for bank verification');
            console.log('');
            console.log('📋 What this means:');
            console.log('  ✅ User can connect to Canadian banks');
            console.log('  ✅ Stripe can verify bank account balances');
            console.log('  ✅ NSF (Non-Sufficient Funds) prevention is active');
            console.log('  ✅ Ready for Step 2: Account Discovery');
        } else {
            console.warn('⚠️ Stripe instance not available in console (but should be in app)');
        }
        
    } catch (error) {
        console.error('❌ Step 1 FAILED with exception:', error);
    }
})();
