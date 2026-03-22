import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://unrumoured-ayden-unpolishable.ngrok-free.dev/webhook/telegram';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

console.log(`🔧 Setting Telegram webhook...`);
console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
console.log(`🤖 Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);

const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;

const postData = JSON.stringify({
  url: WEBHOOK_URL,
  allowed_updates: ['message', 'callback_query'],
});

const options = {
  hostname: 'api.telegram.org',
  path: `/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.ok) {
        console.log('✅ Webhook set successfully!');
        console.log(`📝 Response: ${response.description}`);
      } else {
        console.error('❌ Webhook setup failed');
        console.error(`📝 Error: ${response.description}`);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Raw response:', data);
    }
    process.exit(response.ok ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
