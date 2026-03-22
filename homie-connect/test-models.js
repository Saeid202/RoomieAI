import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello, say hi back');
    console.log('✅ gemini-pro works!');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModel();
