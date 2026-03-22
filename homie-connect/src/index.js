import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('📁 dotenv result:', result.parsed ? Object.keys(result.parsed) : 'No .env file found');
if (result.parsed) {
  console.log('📁 DATABASE_URL from parsed:', result.parsed.DATABASE_URL);
}
console.log('🔧 DATABASE_URL after dotenv:', process.env.DATABASE_URL);

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'homie-connect' });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { query } = await import('./services/homieDB.js');
    const result = await query('SELECT NOW() as current_time');
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      timestamp: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Check renovators in database
app.get('/test-renovators', async (req, res) => {
  try {
    const { query } = await import('./services/homieDB.js');
    
    // Get all renovator profiles
    const profiles = await query(
      'SELECT user_id, service_categories, city, service_radius_km, status, created_at FROM renovator_profiles ORDER BY created_at DESC LIMIT 20'
    );
    
    // Get all renovation requests
    const requests = await query(
      'SELECT id, user_id, address, city, work_type, status, created_at FROM renovation_requests ORDER BY created_at DESC LIMIT 20'
    );
    
    // Get all matches
    const matches = await query(
      'SELECT id, request_id, renovator_id, customer_id, match_score, status FROM renovation_matches ORDER BY created_at DESC LIMIT 20'
    );
    
    res.json({
      status: 'ok',
      renovators: {
        count: profiles.rows.length,
        data: profiles.rows
      },
      requests: {
        count: requests.rows.length,
        data: requests.rows
      },
      matches: {
        count: matches.rows.length,
        data: matches.rows
      }
    });
  } catch (error) {
    console.error('Test renovators error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch data',
      error: error.message
    });
  }
});

// Check in-memory cache
app.get('/test-cache', async (req, res) => {
  try {
    const { getCachedProviders, getCachedSeekers, getCacheStats } = await import('./services/inMemoryMatchingCache.js');
    
    res.json({
      status: 'ok',
      cache: {
        stats: getCacheStats(),
        providers: getCachedProviders(),
        seekers: getCachedSeekers(),
      }
    });
  } catch (error) {
    console.error('Test cache error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cache data',
      error: error.message
    });
  }
});

// Webhook endpoints
app.post('/webhook/telegram', async (req, res) => {
  const { telegramWebhook, handleTelegramButton } = await import('./handlers/telegram.js');
  
  // Route inline button callbacks to handleTelegramButton
  if (req.body.callback_query) {
    return handleTelegramButton(req.body.callback_query)
      .then(() => res.status(200).json({ ok: true }))
      .catch(err => {
        console.error('Telegram button error:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  }
  return telegramWebhook(req, res);
});

app.get('/webhook/whatsapp', async (req, res) => {
  // Meta verification challenge
  const challenge = req.query['hub.challenge'];
  const verifyToken = req.query['hub.verify_token'];
  
  if (verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

app.post('/webhook/whatsapp', async (req, res) => {
  const { whatsappWebhook } = await import('./handlers/whatsapp.js');
  return whatsappWebhook(req, res);
});

app.post('/webhook/sms', async (req, res) => {
  const { smsWebhook } = await import('./handlers/sms.js');
  return smsWebhook(req, res);
});

// Phase 5: In-app chat
// POST /api/chat — send a message
app.post('/api/chat', async (req, res) => {
  try {
    const senderId = req.headers['authorization']?.replace('Bearer ', '').trim();
    if (!senderId) return res.status(401).json({ error: 'Missing Authorization header' });

    const { matchRequestId, message } = req.body;
    if (!matchRequestId || !message) {
      return res.status(400).json({ error: 'matchRequestId and message are required' });
    }

    const { sendMessage } = await import('./services/chatService.js');
    const result = await sendMessage(senderId, matchRequestId, message);
    if (!result.success) return res.status(403).json({ error: result.error });

    res.status(201).json(result.message);
  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/:matchRequestId — fetch message history
app.get('/api/chat/:matchRequestId', async (req, res) => {
  try {
    const requestingUserId = req.headers['authorization']?.replace('Bearer ', '').trim();
    if (!requestingUserId) return res.status(401).json({ error: 'Missing Authorization header' });

    const { matchRequestId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before || null;

    const { getMessages } = await import('./services/chatService.js');
    const result = await getMessages(requestingUserId, matchRequestId, { limit, before });
    if (!result.success) return res.status(403).json({ error: result.error });

    res.json(result);
  } catch (err) {
    console.error('Chat fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Phase 4: Contact reveal — returns partner details only for confirmed matches
// Caller must pass their own userId in the Authorization header: Bearer <userId>
app.get('/api/match/:matchRequestId/contact', async (req, res) => {
  try {
    const requestingUserId = req.headers['authorization']?.replace('Bearer ', '').trim();
    if (!requestingUserId) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const { matchRequestId } = req.params;
    const { getMatchedContactDetails } = await import('./services/contactRevealService.js');
    const result = await getMatchedContactDetails(requestingUserId, matchRequestId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Contact reveal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Homie Connect server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
