// Copy and paste this into browser console to diagnose errors
(async function diagnoseErrors() {
    console.log('🔍 Diagnosing Stripe Financial Connections Errors');
    console.log('=' .repeat(50));
    
    // Check 1: User Authentication
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('👤 User Auth:', userError ? '❌ ERROR' : '✅ OK');
        if (userError) console.error('   Error:', userError);
        if (user) console.log('   User:', user.email);
    } catch (e) {
        console.log('👤 User Auth: ❌ EXCEPTION', e.message);
    }
    
    // Check 2: Supabase Function
    try {
        console.log('🔧 Testing Supabase Function...');
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { action: 'test' }
        });
        console.log('🔧 Function Test:', error ? '❌ ERROR' : '✅ OK');
        if (error) {
            console.error('   Error:', error);
            console.error('   Error Code:', error.code);
            console.error('   Error Message:', error.message);
        }
        if (data) console.log('   Data:', data);
    } catch (e) {
        console.log('🔧 Function Test: ❌ EXCEPTION', e.message);
    }
    
    // Check 3: Stripe Loading
    try {
        console.log('💳 Checking Stripe...');
        if (typeof stripe !== 'undefined') {
            console.log('💳 Stripe: ✅ LOADED');
        } else {
            console.log('💳 Stripe: ❌ NOT LOADED');
        }
    } catch (e) {
        console.log('💳 Stripe: ❌ EXCEPTION', e.message);
    }
    
    // Check 4: Network Requests
    console.log('🌐 Checking recent network requests...');
    // This will show any failed requests in the Network tab
    
    console.log('\n📋 Next Steps:');
    console.log('1. Look for specific error messages above');
    console.log('2. Check Network tab for failed requests');
    console.log('3. Share the exact error messages with me');
})();
