// Test Gemini API directly
const GEMINI_API_KEY = "AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0";

async function testGeminiAPI() {
  console.log("🧪 Testing Gemini API...");
  
  try {
    // Use v1beta for gemini-2.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Hello! Can you hear me? Just say 'Yes, I can hear you!'" }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ API Error:", error);
      return;
    }

    const data = await response.json();
    console.log("✅ API Response:", JSON.stringify(data, null, 2));
    console.log("\n📝 Generated Text:", data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testGeminiAPI();
