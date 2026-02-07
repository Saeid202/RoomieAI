// Detailed 400 error debugging
// Copy and paste this into browser console

(async function debug400Detailed() {
    console.log('🔍 Detailed 400 Error Debugging');
    console.log('=' .repeat(40));
    
    // Check what we're actually sending
    console.log('🟡 Testing what we send to function...');
    
    const testPayload = {
        action: 'test',
        debug: true,
        timestamp: new Date().toISOString()
    };
    
    console.log('📤 Payload we will send:', testPayload);
    
    try {
        // Use fetch directly to see the raw response
        console.log('🌐 Making direct fetch request...');
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
            console.error('❌ No auth token - user not logged in');
            return;
        }
        
        console.log('🔑 Auth token found:', token.substring(0, 20) + '...');
        
        const response = await fetch('https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/manage-financial-connections', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        console.log('📊 Raw response status:', response.status);
        console.log('📊 Raw response headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('📊 Raw response body:', responseText);
        
        if (response.ok) {
            console.log('✅ Direct fetch successful');
            try {
                const jsonData = JSON.parse(responseText);
                console.log('📊 Parsed JSON:', jsonData);
            } catch (e) {
                console.log('⚠️ Response is not valid JSON:', responseText);
            }
        } else {
            console.error('❌ Direct fetch failed with status:', response.status);
            console.error('❌ Response body:', responseText);
            
            // Try to parse as JSON to get error details
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Parsed error:', errorData);
            } catch (e) {
                console.error('❌ Could not parse error as JSON');
            }
        }
        
    } catch (error) {
        console.error('❌ Debug script failed:', error);
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check the raw response above');
    console.log('2. Look for specific error messages');
    console.log('3. Share the exact error with me');
    console.log('4. Check Supabase function logs for more details');
})();
