// Debug script for 404 bank connection issues
// Copy and paste this into browser console

(async function debug404Connection() {
    console.log('🔍 Debugging 404 Bank Connection Issues');
    console.log('=' .repeat(45));
    
    // Check current URL
    console.log('🌐 Current URL:', window.location.href);
    console.log('🌐 Origin:', window.location.origin);
    
    // Test Stripe session creation
    try {
        console.log('🟡 Testing session creation...');
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'create-session',
                country: 'CA',
                debug: true
            }
        });
        
        if (sessionError) {
            console.error('❌ Session creation failed:', sessionError);
            return;
        }
        
        console.log('✅ Session created successfully');
        console.log('📊 Session data:', {
            hasClientSecret: !!sessionData?.client_secret,
            clientSecretPrefix: sessionData?.client_secret?.substring(0, 10),
            sessionId: sessionData?.session_id
        });
        
        // Test Stripe modal without opening
        console.log('🟡 Testing Stripe modal readiness...');
        if (typeof stripe !== 'undefined') {
            console.log('✅ Stripe is ready');
            console.log('💳 Stripe version:', stripe.version);
            
            // Check if we can collect financial connections (without actually doing it)
            console.log('🔍 Stripe Financial Connections available:', typeof stripe.collectFinancialConnectionsAccounts);
            
        } else {
            console.error('❌ Stripe not available');
        }
        
        console.log('\n📋 Common 404 Causes:');
        console.log('1. Return URL mismatch');
        console.log('2. Stripe API version issue');
        console.log('3. Canadian bank support issue');
        console.log('4. Network connectivity problem');
        
        console.log('\n🔧 Try these fixes:');
        console.log('1. Refresh the page and try again');
        console.log('2. Check if you\'re on the correct URL (localhost:5175)');
        console.log('3. Try a different bank (RBC, TD, etc.)');
        console.log('4. Check network connection');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
})();
