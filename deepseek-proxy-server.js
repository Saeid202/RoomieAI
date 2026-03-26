import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-2531714d05d94a16a216aa80c984b41d';

app.post('/api/deepseek-chat', async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 800 } = req.body;

    console.log('Proxying request to DeepSeek API...');
    const startTime = Date.now();

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    const endTime = Date.now();
    console.log(`DeepSeek API responded in ${endTime - startTime}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received successfully');

    res.json(data);
  } catch (error) {
    console.error('Error in proxy server:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`DeepSeek proxy server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/deepseek-chat`);
});
