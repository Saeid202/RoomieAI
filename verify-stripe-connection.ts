// Simple verification script for Stripe Financial Connections
// Run this in browser console to test Step 1

async function verifyStripeFinancialConnections() {
    console.log('🔍 Verifying Stripe Financial Connections - Step 1');
    
    try {
        // 1. Check if Stripe is loaded
        const stripe = window.Stripe;
        if (!stripe) {
            console.error('❌ Stripe not loaded');
            return false;
        }
        console.log('✅ Stripe loaded');
        
        // 2. Check if we can access Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('❌ User not authenticated:', userError);
            return false;
        }
        console.log('✅ User authenticated:', user.email);
        
        // 3. Test Stripe Financial Connections session creation
        console.log('🟡 Testing Stripe Financial Connections session...');
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'create-session',
                test: true // Add test flag
            }
        });
        
        console.log('📊 Session response:', { sessionData, sessionError });
        
        if (sessionError) {
            console.error('❌ Session creation failed:', sessionError);
            return false;
        }
        
        if (!sessionData?.client_secret) {
            console.error('❌ No client secret returned');
            return false;
        }
        
        if (!sessionData.client_secret.startsWith('fcsess_')) {
            console.error('❌ Invalid client secret format:', sessionData.client_secret);
            return false;
        }
        
        console.log('✅ Stripe Financial Connections session created successfully');
        console.log('🔑 Client secret:', sessionData.client_secret.substring(0, 20) + '...');
        
        // 4. Test if we can open the Stripe modal (without actually opening it)
        console.log('🟡 Stripe modal ready to open');
        console.log('✅ Step 1 Verification: PASSED');
        console.log('🎉 Stripe Financial Connections is ready for bank verification');
        
        return true;
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
        return false;
    }
}

// Auto-run verification
verifyStripeFinancialConnections();
