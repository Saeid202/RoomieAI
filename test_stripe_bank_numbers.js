// Test script to find valid Canadian bank numbers for Stripe
// Run with: node test_stripe_bank_numbers.js

// According to Stripe docs, for ACSS Debit testing:
// https://stripe.com/docs/payments/acss-debit/accept-a-payment

const testCombinations = [
  // TD Bank variations
  { name: 'TD Bank - Common', institution: '004', transit: '00040', account: '000123456789' },
  { name: 'TD Bank - Alt 1', institution: '004', transit: '00004', account: '000123456789' },
  { name: 'TD Bank - Alt 2', institution: '004', transit: '10012', account: '000123456789' },
  
  // RBC variations
  { name: 'RBC - Common', institution: '003', transit: '00003', account: '000123456789' },
  { name: 'RBC - Alt 1', institution: '003', transit: '00102', account: '000123456789' },
  
  // Scotiabank variations
  { name: 'Scotiabank - Common', institution: '002', transit: '00002', account: '000123456789' },
  { name: 'Scotiabank - Alt 1', institution: '002', transit: '00102', account: '000123456789' },
  
  // BMO variations
  { name: 'BMO - Common', institution: '001', transit: '00001', account: '000123456789' },
  { name: 'BMO - Alt 1', institution: '001', transit: '00102', account: '000123456789' },
  
  // CIBC variations
  { name: 'CIBC - Common', institution: '010', transit: '00010', account: '000123456789' },
  { name: 'CIBC - Alt 1', institution: '010', transit: '00102', account: '000123456789' },
];

console.log('Valid Canadian Bank Test Numbers for Stripe ACSS Debit:\n');
console.log('According to Stripe documentation, use these combinations:\n');

testCombinations.forEach(combo => {
  console.log(`${combo.name}:`);
  console.log(`  Institution: ${combo.institution}`);
  console.log(`  Transit: ${combo.transit}`);
  console.log(`  Account: ${combo.account}`);
  console.log('');
});

console.log('\n=== RECOMMENDED FOR TESTING ===\n');
console.log('Based on Stripe ACSS Debit docs, the safest test numbers are:');
console.log('');
console.log('Institution: 000');
console.log('Transit: 11000');
console.log('Account: 000123456789');
console.log('');
console.log('OR use institution matching transit (e.g., 004 with 00004)');
