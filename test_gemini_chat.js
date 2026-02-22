// Test Gemini Chat Edge Function
// Run with: node test_gemini_chat.js

const SUPABASE_URL = 'https://bjesofgfbuyzjamyliys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZXNvZmdmYnV5emphbXlsaXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDcxOTcsImV4cCI6MjA2Nzc4MzE5N30.V0RSLBpoCehRW_CjIwfOmIm0iJio3Y2auDBoFyjUfOs';

async function testGeminiChat() {
  console.log('🧪 Testing Gemini Chat Edge Function...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message: 'Hello, can you hear me?',
        conversationHistory: [],
        systemPrompt: 'You are a helpful assistant.',
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n📦 Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS! AI Response:', data.response);
    } else {
      console.log('\n❌ FAILED! Error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGeminiChat();
