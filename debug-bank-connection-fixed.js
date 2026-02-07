// Fixed bank connection debug script
// Copy and paste this into browser console

(async function debugBankConnection() {
    console.log('🏦 Debugging Actual Bank Connection');
    console.log('=' .repeat(40));
    
    try {
        // Check if stripe is available
        if (typeof stripe === 'undefined') {
            console.error('❌ Stripe not available in console');
            console.log('🔍 This is normal - Stripe is only available in the React component');
            console.log('📋 To test bank connection, use the UI instead');
            return;
        }
        
        console.log('✅ Stripe available, testing connection...');
        
        // Get a fresh session
        const { data: sessionData } = await supabase.functions.invoke('manage-financial-connections', {
            body: { action: 'create-session' }
        });
        
        if (sessionData?.client_secret) {
            console.log('✅ Session ready, testing Stripe modal...');
            console.log('🔑 Client secret:', sessionData.client_secret.substring(0, 20) + '...');
            
            const result = await stripe.collectFinancialConnectionsAccounts({
                clientSecret: sessionData.client_secret,
            });
            
            if (result.error) {
                console.error('❌ Stripe modal error:', result.error);
                console.log('📋 Error details:', {
                    code: result.error.code,
                    type: result.error.type,
                    message: result.error.message
                });
            } else {
                console.log('✅ Stripe modal opened successfully!');
                console.log('🎉 Bank connection is working!');
            }
        } else {
            console.error('❌ No session data received');
        }
    } catch (e) {
        console.error('❌ Bank connection debug failed:', e);
    }
    
    console.log('\n📋 Recommendation:');
    console.log('Use the UI to test bank connection:');
    console.log('1. Go to Digital Wallet');
    console.log('2. Click "Bank Account (ACH)"');
    console.log('3. Click "Choose Your Canadian Bank"');
    console.log('4. Select any bank (RBC, TD, etc.)');
})();
