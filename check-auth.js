// Check authentication status
// Copy and paste this into browser console

(async function checkAuth() {
    console.log('🔐 Checking Authentication Status');
    console.log('=' .repeat(35));
    
    try {
        // Check if user is logged in
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('👤 User check:', userError ? '❌ ERROR' : '✅ OK');
        
        if (userError) {
            console.error('❌ User error:', userError);
            return;
        }
        
        if (!user) {
            console.error('❌ No user found - please log in');
            return;
        }
        
        console.log('✅ User logged in:', user.email);
        console.log('🆔 User ID:', user.id);
        
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔑 Session check:', sessionError ? '❌ ERROR' : '✅ OK');
        
        if (sessionError) {
            console.error('❌ Session error:', sessionError);
            return;
        }
        
        if (!session) {
            console.error('❌ No session found');
            return;
        }
        
        console.log('✅ Session valid');
        console.log('🔑 Access token:', session.access_token ? '✅ EXISTS' : '❌ MISSING');
        console.log('🔑 Token length:', session.access_token?.length || 0);
        
        // Test function call with explicit auth
        console.log('\n🟡 Testing function with explicit auth...');
        
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { action: 'test' }
        });
        
        console.log('📊 Function result:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        
        if (error) {
            console.error('❌ Function call failed');
            console.error('  - Error type:', typeof error);
            console.error('  - Error message:', error.message);
            console.error('  - Error details:', error);
        } else {
            console.log('✅ Function call successful');
        }
        
    } catch (e) {
        console.error('❌ Auth check failed:', e);
    }
})();
