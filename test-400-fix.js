// Test script to verify 400 error fix
// Copy and paste this into browser console

(async function test400Fix() {
    console.log('🔧 Testing 400 Error Fix');
    console.log('=' .repeat(30));
    
    // Test 1: Test action with proper JSON
    console.log('🟡 Test 1: Valid request format');
    try {
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'test',
                debug: true
            }
        });
        
        console.log('📊 Test 1 Result:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        
        if (error) {
            console.error('❌ Test 1 failed:', error.message);
        } else {
            console.log('✅ Test 1 passed: Function accepts valid JSON');
        }
    } catch (e) {
        console.error('❌ Test 1 exception:', e.message);
    }
    
    // Test 2: Test create-session action
    console.log('\n🟡 Test 2: Create session action');
    try {
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'create-session',
                country: 'CA'
            }
        });
        
        console.log('📊 Test 2 Result:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        
        if (error) {
            console.error('❌ Test 2 failed:', error.message);
            if (error.message.includes('Invalid action')) {
                console.log('🔧 This might be a validation issue');
            }
        } else {
            console.log('✅ Test 2 passed: Session creation works');
            if (data?.client_secret) {
                console.log('🔑 Client secret:', data.client_secret.substring(0, 20) + '...');
            }
        }
    } catch (e) {
        console.error('❌ Test 2 exception:', e.message);
    }
    
    // Test 3: Test invalid action (should return 400)
    console.log('\n🟡 Test 3: Invalid action (should return 400)');
    try {
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'invalid-action'
            }
        });
        
        console.log('📊 Test 3 Result:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        
        if (error) {
            console.log('✅ Test 3 passed: Invalid action properly rejected');
            console.log('  - Error message:', error.message);
        } else {
            console.log('❌ Test 3 failed: Invalid action was accepted');
        }
    } catch (e) {
        console.error('❌ Test 3 exception:', e.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('If all tests pass, the 400 error should be fixed.');
    console.log('Try connecting to a Canadian bank now!');
})();
