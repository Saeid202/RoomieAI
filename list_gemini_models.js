// List available Gemini models
const GEMINI_API_KEY = "AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0";

async function listModels() {
  console.log("📋 Listing available Gemini models...\n");
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ API Error:", error);
      return;
    }

    const data = await response.json();
    
    console.log("✅ Available models:\n");
    data.models.forEach(model => {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
      console.log("");
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

listModels();
