// Test script for viewing appointments system
// Run this in browser console AFTER logging in

console.log('🧪 Testing Viewing Appointments System...\n');

// Test 1: Check authentication
console.log('1️⃣ Checking authentication...');
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError) {
  console.error('❌ Auth error:', authError);
} else if (!user) {
  console.error('❌ Not logged in!');
} else {
  console.log('✅ Logged in as:', user.email, '(ID:', user.id + ')');
}

// Test 2: Check landlord_availability table
console.log('\n2️⃣ Checking landlord_availability table...');
const { data: availData, error: availError } = await supabase
  .from('landlord_availability')
  .select('*')
  .limit(1);

if (availError) {
  console.error('❌ Error accessing landlord_availability:', availError);
} else {
  console.log('✅ landlord_availability table exists and is accessible');
  console.log('   Sample data:', availData);
}

// Test 3: Check properties table
console.log('\n3️⃣ Checking properties table...');
const { data: propsData, error: propsError } = await supabase
  .from('properties')
  .select('id, address, city, province, status')
  .eq('user_id', user?.id)
  .order('created_at', { ascending: false });

if (propsError) {
  console.error('❌ Error accessing properties:', propsError);
} else {
  console.log('✅ Properties table accessible');
  console.log('   Your properties:', propsData?.length || 0);
  if (propsData && propsData.length > 0) {
    propsData.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.address} (${p.status})`);
    });
  } else {
    console.log('   ⚠️  You have no properties yet');
  }
}

// Test 4: Check viewing appointments table
console.log('\n4️⃣ Checking property_viewing_appointments table...');
const { data: apptData, error: apptError } = await supabase
  .from('property_viewing_appointments')
  .select('*')
  .limit(1);

if (apptError) {
  console.error('❌ Error accessing property_viewing_appointments:', apptError);
} else {
  console.log('✅ property_viewing_appointments table exists and is accessible');
}

// Test 5: Try to fetch landlord properties (using service method logic)
console.log('\n5️⃣ Testing getLandlordProperties logic...');
if (user) {
  const { data: landlordProps, error: landlordPropsError } = await supabase
    .from('properties')
    .select('id, address, city, province, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (landlordPropsError) {
    console.error('❌ Error:', landlordPropsError);
  } else {
    const filtered = (landlordProps || []).filter(p => p.status !== 'archived');
    console.log('✅ Found', filtered.length, 'non-archived properties');
    filtered.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.address || 'No address'} - ${p.city || ''}, ${p.province || ''}`);
    });
  }
}

// Test 6: Check RLS policies
console.log('\n6️⃣ Checking RLS policies...');
const { data: policies, error: policiesError } = await supabase
  .rpc('exec_sql', { 
    sql: `SELECT tablename, policyname, cmd 
          FROM pg_policies 
          WHERE tablename IN ('properties', 'landlord_availability', 'property_viewing_appointments')
          ORDER BY tablename, policyname;`
  });

if (policiesError) {
  console.log('⚠️  Cannot check policies (requires admin access)');
} else {
  console.log('✅ RLS policies:', policies);
}

console.log('\n✨ Test complete! Check results above.');
console.log('\n📋 Summary:');
console.log('   - If all tests pass, the system is working correctly');
console.log('   - If you see errors, check the specific test that failed');
console.log('   - Make sure you\'re logged in as a landlord');
console.log('   - Make sure you have at least one property created');
