// Test script to check payment intent creation
// This simulates what the frontend is doing

const testPaymentIntent = {
  amount: 0, // $0.00 in cents
  currency: 'cad',
  payment_method_types: ['acss_debit'],
  payment_method: 'pm_test_123', // This would be the actual payment method ID
  payment_method_options: {
    acss_debit: {
      mandate_options: {
        payment_schedule: 'interval',
        interval_description: 'Monthly rent payment',
        transaction_type: 'personal'
      },
      verification_method: 'instant'
    }
  },
  metadata: {
    tenant_id: 'test-tenant',
    landlord_id: 'test-landlord',
    property_id: 'test-property',
    due_date: '2026-03-15',
    payment_type: 'rent'
  }
};

console.log('Test Payment Intent Request:');
console.log(JSON.stringify(testPaymentIntent, null, 2));

// The issue is likely:
// 1. Amount is 0 - Stripe might reject $0 payments
// 2. Payment method ID is not being passed correctly
// 3. Customer ID issue

console.log('\nPossible issues:');
console.log('1. Amount is $0.00 - Stripe requires minimum amount');
console.log('2. Payment method ID might be invalid');
console.log('3. Check if payment_method is being passed correctly');
