// Quick Fix Checklist - Run this in browser console
(async function quickFixChecklist() {
    console.log('🔧 Quick Fix Checklist');
    console.log('=' .repeat(30));
    
    let issues = [];
    let fixes = [];
    
    // Check 1: User logged in?
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            issues.push('❌ User not logged in');
            fixes.push('👉 Please log in and try again');
        } else {
            console.log('✅ User logged in');
        }
    } catch (e) {
        issues.push('❌ Auth check failed');
        fixes.push('👉 Refresh page and log in again');
    }
    
    // Check 2: Function accessible?
    try {
        const { data, error } = await supabase.functions.invoke('manage-financial-connections', {
            body: { action: 'test' }
        });
        
        if (error) {
            issues.push('❌ Function error: ' + error.message);
            if (error.message.includes('STRIPE_SECRET_KEY')) {
                fixes.push('👉 Configure STRIPE_SECRET_KEY in Supabase Edge Functions');
            } else {
                fixes.push('👉 Check Supabase function logs');
            }
        } else {
            console.log('✅ Function working');
            console.log('📊 Function data:', data);
        }
    } catch (e) {
        issues.push('❌ Function call failed');
        fixes.push('👉 Check network connection');
    }
    
    // Check 3: Stripe loaded?
    if (typeof stripe === 'undefined') {
        issues.push('❌ Stripe not loaded');
        fixes.push('👉 Refresh the page');
    } else {
        console.log('✅ Stripe loaded');
    }
    
    // Results
    console.log('\n📋 Issues Found:', issues.length);
    issues.forEach(issue => console.log('  ' + issue));
    
    console.log('\n🔧 Suggested Fixes:');
    fixes.forEach(fix => console.log('  ' + fix));
    
    if (issues.length === 0) {
        console.log('\n🎉 Everything looks good! Try connecting to a bank now.');
    }
})();
