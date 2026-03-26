// Alternative bank connection method for 404 issues
// This bypasses the country filter and uses a more direct approach

async function connectBankAlternative(bank) {
    console.log('🔄 Using alternative bank connection method');
    
    try {
        // Method 1: Try without country restrictions
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('manage-financial-connections', {
            body: { 
                action: 'create-session',
                no_country_filter: true,
                bank_id: bank.id
            }
        });
        
        if (sessionError) {
            console.error('❌ Alternative method failed:', sessionError);
            return false;
        }
        
        console.log('✅ Alternative session created:', sessionData);
        
        // Open Stripe modal with the alternative session
        if (typeof stripe !== 'undefined') {
            const result = await stripe.collectFinancialConnectionsAccounts({
                clientSecret: sessionData.client_secret,
            });
            
            if (result.error) {
                console.error('❌ Alternative connection error:', result.error);
                return false;
            }
            
            console.log('✅ Alternative connection successful!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Alternative method exception:', error);
        return false;
    }
}

// Add this to your bank selection button as a fallback
// Example usage:
// const success = await connectBankAlternative(selectedBank);
// if (!success) {
//   // Show error message or try manual entry
// }
